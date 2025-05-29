const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const fs = require("fs");
const path = require("path");
const {log} = require("../utils/logger");
const minioClient = require('./minioClient');
const sequelize = require('./db').sequelize;
require("dotenv").config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const SESSION_FILE = path.join(__dirname, "./session.txt");

// Load saved session if available
let savedSession = "";
if (fs.existsSync(SESSION_FILE)) {
    savedSession = fs.readFileSync(SESSION_FILE, "utf8").trim();
}
const stringSession = new StringSession(savedSession || "");

async function createClient() {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    try {
    if (!savedSession) {
        await client.start({
            phoneNumber: async () => await input.text("📞 Phone number: "),
            password: async () => await input.text("🔒 2FA password: "),
            phoneCode: async () => await input.text("📲 Code from Telegram: "),
            onError: (err) => console.log("❌ Error:", err),
        });

        // Save session to file
        fs.writeFileSync(SESSION_FILE, client.session.save(), "utf8");
        log("✅ New session created and saved.");
        await ensureBucket(process.env.AUDIO_BUCKET_NAME);
        await ensureBucket(process.env.COVER_BUCKET_NAME);
        await sequelize.authenticate();
    } else {
        await client.connect();
        log("🔁 Reused saved session. Connection successful.");
        await ensureBucket(process.env.AUDIO_BUCKET_NAME);
        await ensureBucket(process.env.COVER_BUCKET_NAME);
        await sequelize.authenticate();
    }

    return client;
    } catch (err) {
        log(`❌ Connection failed: ${err.message}`);
        throw err;
    }
}



async function ensureBucket(bucketName) {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
        await minioClient.makeBucket(bucketName, 'us-east-1');
        log(`✅ Bucket "${bucketName}" created`);
    } else {
        log(`🔁 Bucket "${bucketName}" already exists`);
    }
}


module.exports = { createClient };
