const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../logs/crawler.log");

// Ensure the logs folder exists
if (!fs.existsSync(path.dirname(logFile))) {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
}

function log(message) {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ${message}`;

    console.log(fullMessage);
    fs.appendFileSync(logFile, fullMessage + "\n", "utf8");
}

module.exports = { log };
