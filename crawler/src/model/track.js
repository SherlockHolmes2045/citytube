class Track {
    /**
     * @param {string?} musicBrainzId - Track id from musicBrainz api
     * @param {string} name - The title name from the telegram channel
     * @param {string?} musicBrainzName - The title name from the musicBrainzApi
     * @param {string} storageId - The storage Id from minio
     * @param {string} messageId - The messageId from telegram channel
     */
    constructor(name, musicBrainzId ,musicBrainzName,storageId,messageId) {
        this.name = name;
        this.musicBrainzId = musicBrainzId;
        this.musicBrainzName = musicBrainzName;
        this.storageId = storageId;
        this.messageId = messageId;
    }

}

module.exports = Track;
