
const {createClient} = require("./client");
const {log} = require("./logger");
const Album = require("./album");
const Artist = require("./artist");
const Track = require("./track");
const minioClient = require("./minioClient");
require("dotenv").config();
const path = require("path");

(async () => {
    const client = await createClient();
    const channelName = "https://t.me/City_Pop";

    log(`🚀 Starting crawl of channel: ${channelName}`);

    const channel = await client.getEntity(channelName);
    let albums = [];
    let currentAlbum = new Album(null,null,null,[]);
    for await (const message of client.iterMessages(channel, { reverse: true,limit: 35 })) {
        if (!message.message && !message.media) continue;

        const baseLog = `🟡 [${message.id}] ${message.date}`;

        // Check for media
        if (message.media) {
            const mediaType = message.media.className;

            switch (mediaType) {
                case "MessageMediaPhoto": {
                    log(`${baseLog} - 📸 Photo message`);
                    // You can now download/save metadata or process it
                    if(currentAlbum.tracks.length === 0){
                        currentAlbum = new Album(null,null,null,null)
                    }else{
                        albums.push(currentAlbum)
                        currentAlbum = new Album(null,null,null,null)
                    }

                    currentAlbum.name = message.message.split('-')[1].trim();
                    const match = currentAlbum.name.match(/^(.*?)\s*\((\d{4})\)$/);

                    if (match) {
                        currentAlbum.name = match[1].trim();
                        currentAlbum.releaseDate = parseInt(match[2]);

                    }

                    currentAlbum.cover = message;
                    currentAlbum.messageId = message.id;

                    currentAlbum.artist = await searchArtistMetadata(message.message.split('-')[0].trim());
                    const albumMetadata = await searchAlbumMetadata(currentAlbum.artist.musicBrainzId, currentAlbum.name);
                    currentAlbum.musicBrainzId = albumMetadata.id;
                    currentAlbum.musicBrainzName = albumMetadata.name;
                    currentAlbum.releaseDate = new Date(albumMetadata.releaseDate);
                    currentAlbum.genres = albumMetadata.genres;

                    const buffer = await client.downloadMedia(message.media);

                    const uploadResult = await uploadToMinio(process.env.COVER_BUCKET_NAME, `/covers/${message.id}.jpg`,buffer,'image/jpeg');
                    currentAlbum.cover = uploadResult.etag;
                    log(`Saved media to: ${uploadResult.etag}`);


                    break;
                }

                case "MessageMediaDocument": {
                    const document = message.media.document;

                    // Look for audio mime type
                    const mimeType = document.mimeType;
                    const isAudio = mimeType && mimeType.startsWith("audio");

                    if (isAudio) {
                        const fileNameAttr = document.attributes.find(
                            (attr) => attr.className === "DocumentAttributeFilename"
                        );
                        const title = message.message.split("-")[1].split('\n')[0].trim();
                        const songResult = await searchSong(title,currentAlbum.artist.musicBrainzName);

                        let extension = "";

                        if (fileNameAttr) {
                            extension = path.extname(fileNameAttr.fileName); // e.g. '.mp3'
                        } else if (document.mimeType) {
                            // Fallback: Map common mime types to extensions
                            const mime = document.mimeType;
                            const mimeMap = {
                                "audio/mpeg": ".mp3",
                                "audio/x-wav": ".wav",
                                "audio/ogg": ".ogg",
                                "image/jpeg": ".jpg",
                                "image/png": ".png",
                                "video/mp4": ".mp4",
                            };
                            extension = mimeMap[mime] || "";
                        }

                        log(`${baseLog} - 🎵 Audio: ${title}`);
                        // TODO: Download or store metadata in DB

                        const buffer = await client.downloadMedia(message.media);


                        const uploadResult = await uploadToMinio(process.env.AUDIO_BUCKET_NAME, `/audios/${message.id}${extension}`,buffer,document.mimeType);
                        log(`Saved media to: ${uploadResult.etag}`);
                        currentAlbum.tracks.push(new Track(title,songResult.id,songResult.title,uploadResult.etag,message.id.toString()));
                    } else {
                        log(`${baseLog} - 📎 Other document: ${mimeType}`);
                    }

                    break;

                }
                default:
                    log(`${baseLog} - 📦 Unknown media type: ${mediaType}`);
            }
        } else if (message.message) {
            // No media, just text
            currentAlbum = new Album(null,null,null,[]);
            log(`${baseLog} - 📝 Text: ${message.message}`);
        }
    }

    log(`✅ Crawling complete`);
    //console.log(albums);

    await client.disconnect();
})();

/**
 * Search MusicBrainz by artist name and optional album title
 * @param {string} artistName
 * @param {string|null} albumName
 * @returns {Promise<Artist>} result object containing artist and optionally release group
 */
async function searchArtistMetadata(artistName, albumName = null) {

    const {MusicBrainzApi} = await import('musicbrainz-api');
    const mbApi = new MusicBrainzApi({
        appName: process.env.MUSICBRAINZ_APP_NAME,
        appVersion: process.env.MUSICBRAINZ_APP_VERSION,
        appContactInfo: process.env.MUSICBRAINZ_APP_CONTACT
    });

    // Step 1: Search artist
    const artistSearch = await mbApi.search('artist', {
        query: artistName,
        country: 'JP'
    });

    const artist = artistSearch.artists.find(a => a.country === 'JP') || artistSearch.artists[0];

    if (!artist) {
        return null;
    }

    const genres  = artist.tags.map(tag => tag.name);

    const sortNames = artist.aliases.map(alias => alias['sort-name']);
    const names = artist.aliases.map(alias => alias.name);
    return new Artist(artistName,artist.id, artist.gender,artist.name,artist['sort-name'],genres,[...sortNames,...names]);
}


/**
 * Search MusicBrainz by artist name and optional album title
 * @param {string} artistId
 * @param {string} albumName
 * @returns {Promise<Object>} result object containing artist and optionally release group
 */
async function searchAlbumMetadata(artistId, albumName = null) {

    const {MusicBrainzApi} = await import('musicbrainz-api');
    const mbApi = new MusicBrainzApi({
        appName: process.env.MUSICBRAINZ_APP_NAME,
        appVersion: process.env.MUSICBRAINZ_APP_VERSION,
        appContactInfo: process.env.MUSICBRAINZ_APP_CONTACT
    });


    const albumSearch = await mbApi.search('release-group', {
        query: `release:${albumName} AND arid:${artistId}`,
        limit: 1
    });

    const album = albumSearch['release-groups'][0];


    if (!album) {
        return null;
    }

    const genres = album.tags.map(tag => tag.name);

    return {
        id: album.id,
        name: album.title,
        releaseDate: album['first-release-date'],
        genres
    };
}



/**
 * Search for a recording by title and artist ID
 * @param {string} title - The title of the song
 * @param {string} artistName - The MusicBrainz artist ID (MBID)
 */
async function searchSong(title,artistName) {

    const {MusicBrainzApi} = await import('musicbrainz-api');
    const mbApi = new MusicBrainzApi({
        appName: process.env.MUSICBRAINZ_APP_NAME,
        appVersion: process.env.MUSICBRAINZ_APP_VERSION,
        appContactInfo: process.env.MUSICBRAINZ_APP_CONTACT
    });


    const result = await mbApi.search('recording', {
        query: `recording:"${title}" AND artist:${artistName}`,
    });

    return result.recordings[0] || [];
}

async function uploadToMinio(bucket, objectName, buffer, contentType) {
    return minioClient.putObject(bucket, objectName, buffer,undefined, {
        'Content-Type': contentType,
    });
}
