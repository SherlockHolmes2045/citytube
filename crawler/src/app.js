const express = require("express");
const {createClient} = require("./service/client");
const {log} = require("./utils/logger");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const {Readable} = require("stream");
const minioClient = require("./service/minioClient");
const {getExtension} = require("./crawler");

let client, channel;

// Initialize the Telegram client
(async () => {
    client = await createClient();
    channel = await client.getEntity("https://t.me/City_Pop");

    app.listen(PORT, () => {
        log(`🚀 Server running on port ${PORT}`);
    });


    app.get("/stream/:messageId", async (req, res) => {
        const messageId = parseInt(req.params.messageId);
        try {
            const messages = await client.getMessages(channel, {ids: messageId});
            const message = messages[0];

            if (!message || !message.media || !message.media.document) {
                return res.status(404).json({error: "Audio not found in message"});
            }

            const document = message.media.document;
            const fileAttr = document.attributes.find(attr => attr.className === "DocumentAttributeFilename");
            const fileName = fileAttr?.fileName;
            const mimeType = document.mimeType;
            const extension = getExtension(fileName, mimeType);
            const objectName = `audios/${messageId}${extension}`;

            if (!mimeType?.startsWith("audio")) {
                const baseLog = `🟡 [${message.id}] ${message.date}`;
                return log(`${baseLog} - 📎 Other document: ${mimeType}`);
            }

            // Check if file already exists in MinIO
            let exists = true;
            try {
                await minioClient.statObject(process.env.AUDIO_BUCKET_NAME, objectName);
            } catch (err) {
                if (err.code === 'NotFound') {
                    exists = false;
                } else {
                    throw err;
                }
            }

            // If not cached, download and upload
            if (!exists) {
                const buffer = await client.downloadMedia(message.media, {
                    file: true // important to get a readable stream
                });
                minioClient.putObject(process.env.AUDIO_BUCKET_NAME, objectName, buffer, buffer.length, {
                    "Content-Type": mimeType
                }).catch(err => {
                    log(`Failed to cache in MinIO: ${err}`);
                });
                res.setHeader("Content-Type", mimeType);
                res.setHeader("Accept-Ranges", "bytes");
                const total = buffer.length;

                const range = req.headers.range;
                if (range) {
                    // Parse range header: e.g., "bytes=500-"
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : total - 1;

                    if (start >= total || end >= total) {
                        res.status(416).header("Content-Range", `bytes */${total}`).end();
                        return;
                    }

                    const chunk = buffer.slice(start, end + 1);

                    res.writeHead(206, {
                        "Content-Range": `bytes ${start}-${end}/${total}`,
                        "Accept-Ranges": "bytes",
                        "Content-Length": chunk.length,
                        "Content-Type": mimeType,
                    });

                    Readable.from(chunk).pipe(res);
                } else {
                    // No Range: serve the whole file
                    res.writeHead(200, {
                        "Content-Length": total,
                        "Content-Type": mimeType,
                        "Accept-Ranges": "bytes",
                    });

                    Readable.from(buffer).pipe(res);
                }


            } else {
                await client.disconnect();

                // Serve the audio file
                const stat = await minioClient.statObject(process.env.AUDIO_BUCKET_NAME, objectName);
                const fileSize = stat.size;
                const range = req.headers.range;
                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                    const chunkSize = end - start + 1;

                    res.writeHead(206, {
                        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                        "Accept-Ranges": "bytes",
                        "Content-Length": chunkSize,
                        "Content-Type": mimeType
                    });

                    const stream = await minioClient.getPartialObject(process.env.AUDIO_BUCKET_NAME, objectName, start, chunkSize);
                    stream.pipe(res);
                } else {
                    res.writeHead(200, {
                        "Content-Length": fileSize,
                        "Content-Type": mimeType,
                        "Accept-Ranges": "bytes"
                    });

                    const stream = await minioClient.getObject(process.env.AUDIO_BUCKET_NAME, objectName);
                    stream.pipe(res);
                }
            }


        } catch (err) {
            console.error("❌ Error streaming audio:", err);
            res.status(500).json({error: "Failed to stream audio"});
        }
    });

})();
