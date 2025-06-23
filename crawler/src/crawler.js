const {createClient} = require("./service/client");
const {log} = require("./utils/logger");
const Album = require("./model/album");
const Track = require("./model/track");
const minioClient = require("./service/minioClient");
require("dotenv").config();
const path = require("path");
const {searchArtistMetadata, searchAlbumMetadata, searchSong} = require("./service/musicbrainz");
const {updateLastMessageId, createArtistWithAlbumAndTracks, getLastMessageId} = require("./service/repository");

(async () => {
    const client = await createClient();
    const channelName = "https://t.me/City_Pop";
    log(`🚀 Starting crawl of channel: ${channelName}`);

    const channel = await client.getEntity(channelName);
    const albums = [];
    let currentAlbum = new Album(null, null, null, null, null, null, null, []);
    let lastId = 0;
    let lastCrawlMessageId = await getLastMessageId();

    client.on('disconnected', async () => {
        log('🔌 Disconnected from Telegram. Saving the progress...');
        if (currentAlbum.tracks.length > 0) {
            await updateLastMessageId(currentAlbum.messageId, albums.length);
        } else {
            await updateLastMessageId(lastId, albums.length);
        }
    });

    client.on('error', async (error) => {
        log('Error in client: ', error);
        if (currentAlbum.tracks.length > 0) {
            await updateLastMessageId(currentAlbum.messageId, albums.length);
        } else {
            await updateLastMessageId(lastId, albums.length);
        }
    });


    for await (const message of client.iterMessages(channel, {reverse: true, offsetId: lastCrawlMessageId})) {
        lastId = message.id;
        try {
            if (!message.message && !message.media) continue;

            const baseLog = `🟡 [${message.id}] ${message.date} ${message.message}`;
            if (message.media) {
                const mediaType = message.media.className;
                const mimeType = message.media.document?.mimeType;
                if (mediaType === "MessageMediaPhoto" || mimeType?.startsWith('image/')) {
                    if(currentAlbum.messageId +1 !== message.id){
                        if (currentAlbum.tracks.length > 0) {
                            await createArtistWithAlbumAndTracks(currentAlbum);
                            albums.push(currentAlbum);
                        }
                        currentAlbum = new Album(null, null, null, null, null, null, null, []);
                        currentAlbum = await processPhotoMessage(message, currentAlbum, albums, client);

                    }
                } else if (mediaType === "MessageMediaDocument") {
                    if (currentAlbum.name != null && currentAlbum.cover != null) {
                        let track = await processDocumentMessage(message, currentAlbum);
                        currentAlbum.tracks.push(track);
                    }

                } else {
                    if (currentAlbum.tracks.length > 0) {
                        await createArtistWithAlbumAndTracks(currentAlbum);
                        albums.push(currentAlbum);
                    }
                    currentAlbum = new Album(null, null, null, null, null, null, null, []);
                    log(`${baseLog} - 📦 Unknown media type: ${mediaType}`);
                }
            } else {
                if (currentAlbum.tracks.length > 0) {
                    await createArtistWithAlbumAndTracks(currentAlbum);
                    albums.push(currentAlbum);
                }
                currentAlbum = new Album(null, null, null, null, null, null, null, []);
                log(`${baseLog} - 📝 Text: ${message.message}`);
            }
        } catch (err) {
            if (currentAlbum.tracks.length > 0) {
                await updateLastMessageId(currentAlbum.messageId, albums.length);
            } else {
                await updateLastMessageId(lastId, albums.length);
            }
            console.error(err);
            log(`Error occurred while crawling ${err}`);
            break;

        }

    }

    const albumExist = albums.find(album => album.messageId === currentAlbum.messageId);
    if (!albumExist) {
        await createArtistWithAlbumAndTracks(currentAlbum);
        albums.push(currentAlbum);
    }

    if (currentAlbum.tracks.length > 0) {
        await updateLastMessageId(currentAlbum.messageId, albums.length);
    } else {
        await updateLastMessageId(lastId, albums.length);
    }

    log(`✅ Crawling complete ${albums}`);
    console.log(albums);
    await client.disconnect();
    process.exit(0);
})();

async function processPhotoMessage(message, currentAlbum, albums, client) {
    const baseLog = `🟡 [${message.id}] ${message.date}`;

    const nameMessage = message.message.split('\n')[0].trim();
    const [artistName, albumRaw] = nameMessage.split(/[‐‑‒–—―-]/);
    let albumName = albumRaw.trim().split('\n')[0]?.trim();
    if (nameMessage.split(/[‐‑‒–—―-]/).length > 2) {
        albumName = albumName + "-" + nameMessage.split(/[‐‑‒–—―-]/).slice(2).join("");
    }
    const match = albumName.match(/^(.*?)\s*\((\d{4})\)$/);

    currentAlbum.name = match ? match[1].trim() : albumName;
    currentAlbum.releaseDate = match ? parseInt(match[2]) : null;
    currentAlbum.cover = message;
    currentAlbum.messageId = message.id;

    currentAlbum.artist = await searchArtistMetadata(artistName.trim());
    const albumMetadata = await searchAlbumMetadata(currentAlbum.artist.musicBrainzId, currentAlbum.name);

    currentAlbum.musicBrainzId = albumMetadata?.id;
    currentAlbum.musicBrainzName = albumMetadata?.name;
    currentAlbum.releaseDate = albumMetadata?.releaseDate ? new Date(albumMetadata.releaseDate) : currentAlbum.releaseDate;
    currentAlbum.genres = albumMetadata?.genres || [];

    const buffer = await client.downloadMedia(message.media);
    const uploadResult = await uploadToMinio(process.env.COVER_BUCKET_NAME, `/covers/${message.id}.jpg`, buffer, 'image/jpeg');
    currentAlbum.cover = uploadResult.etag;
    log(baseLog);
    log(`Saved cover to: ${uploadResult.etag}`);

    return currentAlbum;
}

async function processDocumentMessage(message, currentAlbum) {
    const baseLog = `🟡 [${message.id}] ${message.date}`;
    const document = message.media.document;
    const mimeType = document.mimeType;

    if (!mimeType?.startsWith("audio")) {
        return log(`${baseLog} - 📎 Other document: ${mimeType}`);
    }


    let title = "";

    if (message.message && !message.message.startsWith("[Credits to ")) {

        title = message.message.split(/[‐‑‒–—―-]/)[1].split('\n')[0].trim();
    } else {
        const fileAttr = document.attributes.find(attr => attr.className === "DocumentAttributeAudio");
        title = fileAttr?.title;
    }

    const songResult = await searchSong(title, currentAlbum.artist.musicBrainzName);

    return new Track(title, songResult?.id, songResult?.title, message.id.toString());
}

function getExtension(fileName, mimeType) {
    if (fileName) return path.extname(fileName);

    const mimeMap = {
        "audio/mpeg": ".mp3",
        "audio/x-wav": ".wav",
        "audio/ogg": ".ogg",
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "video/mp4": ".mp4",
    };

    return mimeMap[mimeType] || "";
}


async function uploadToMinio(bucket, objectName, buffer, contentType) {
    return minioClient.putObject(bucket, objectName, buffer, undefined, {
        'Content-Type': contentType,
    });
}

module.exports = {
    getExtension
};