class Album {
    /**
     * @param {string?} name - The name of the album
     * @param {string?} artist - The artist name
     * @param {Message?} cover - The Telegram Message object for the album cover
     * @param {Message[]} titles - An array of Telegram Message objects representing audio tracks
     */
    constructor(name, artist, cover, titles = []) {
        this.name = name;
        this.artist = artist;
        this.cover = cover;     // This is a Telegram Message object containing the image
        this.titles = titles;   // This is a list of Telegram Message objects (audio)
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
