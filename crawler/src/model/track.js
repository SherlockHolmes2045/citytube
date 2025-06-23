class Track {
    /**
     * @param {string?} musicBrainzId - Track id from musicBrainz api
     * @param {string} name - The title name from the telegram channel
     * @param {string?} musicBrainzName - The title name from the musicBrainzApi
     * @param {string} messageId - The messageId from telegram channel
     */
    constructor(name, musicBrainzId, musicBrainzName, messageId) {
        this.name = name;
        this.musicBrainzId = musicBrainzId;
        this.musicBrainzName = musicBrainzName;
        this.messageId = messageId;
    }

}

module.exports = Track;
