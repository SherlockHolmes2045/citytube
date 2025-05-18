const {createClient} = require("./client");
const {log} = require("./logger");
const Album = require("./album");
require("dotenv").config();

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
                case "MessageMediaPhoto":
                    console.log(`${baseLog} - 📸 Photo message`);
                    // You can now download/save metadata or process it
                    if(currentAlbum.titles.length === 0){
                        currentAlbum = new Album(null,null,null,[])
                    }else{
                        albums.push(currentAlbum)
                        currentAlbum = new Album(null,null,null,[])
                    }

                    currentAlbum.name = message.message.split('-')[1].trim();
                    currentAlbum.cover = message;
                    currentAlbum.artist = message.message.split('-')[0].trim();
                    break;

                case "MessageMediaDocument":
                    const document = message.media.document;

                    // Look for audio mime type
                    const mimeType = document.mimeType;
                    const isAudio = mimeType && mimeType.startsWith("audio");

                    if (isAudio) {
                        const fileNameAttr = document.attributes.find(
                            (attr) => attr.className === "DocumentAttributeFilename"
                        );
                        const title = fileNameAttr ? fileNameAttr.fileName : "Unknown audio";

                        log(`${baseLog} - 🎵 Audio: ${title}`);
                        // TODO: Download or store metadata in DB
                        currentAlbum.titles.push(message)
                    } else {
                        log(`${baseLog} - 📎 Other document: ${mimeType}`);
                    }

                    break;

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
    console.log(albums);

    await client.disconnect();
})();
