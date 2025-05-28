const CrawlProgress = require('../entity/CrawlProgress');


// Get last crawled message ID
async function getLastMessageId() {
    const progress = await CrawlProgress.findByPk(1);
    return progress?.lastMessageId || 0;
}

// Update progress after processing each message
async function updateLastMessageId(messageId,albumParsed) {
    await CrawlProgress.upsert({
        //id: 1,
        lastMessageId: messageId,
        albumParsed: albumParsed
    });
}

module.exports = {
    getLastMessageId,
    updateLastMessageId,
};
