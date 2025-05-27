const Artist = require("./artist");

class Album {
    /**
     * @param {string?} name - The name of the album
     * @param {string?} musicBrainzName - The name of the album from musicBrainz Api
     * @param {string?} musicBrainzId - The id of the album from musicBrainz Api
     * @param {Artist?} artist - The artist name
     * @param {String} cover - The Telegram Message object for the album cover
     * @param {Track[]} tracks - An array of Telegram Message objects representing audio tracks
     * @param {int} releaseDate - The album release date
     * @param {int} messageId - The id of the message from Telegram
     * @param {String[]} genres - The id of the message from Telegram
     */
    constructor(name, cover, releaseDate,messageId,musicBrainzName,musicBrainzId,artist = new Artist(''), tracks = [], genres= []) {
        this.name = name;
        this.artist = artist;
        this.cover = cover;     // This is a Telegram Message object containing the image
        this.tracks = tracks;   // This is a list of Telegram Message objects (audio)
        this.releaseDate = releaseDate;
        this.messageId = messageId;
        this.musicBrainzName = musicBrainzName;
        this.musicBrainzId = musicBrainzId;
        this.genres = genres;
    }

    /**
     * Add a title (audio message) to the album
     * @param {Message?} message
     */
    addTitle(message) {
        this.titles.push(message);
    }

    /**
     * Get number of tracks
     */
    get trackCount() {
        return this.titles.length;
    }

    /**
     * Print a basic summary of the album
     */
    summary() {
        return `${this.name} by ${this.artist} (${this.trackCount} track${this.trackCount !== 1 ? 's' : ''})`;
    }
}

module.exports = Album;
