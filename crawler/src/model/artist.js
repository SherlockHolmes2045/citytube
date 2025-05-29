class Artist {
    /**
     * @param {string?} musicBrainzId - Artist id from musicBrainz api
     * @param {string} name - The artist name from the telegram channel
     * @param {string?} musicBrainzName - The artist name from the musicBrainzApi
     * @param {string?} musicBrainzSortName - The artist sort name from the musicBrainzApi
     * @param {String[]} aliases - Names variation from the musicBrainz
     * @param {String?} gender - Artist gender
     * @param {String[]} genres - Artist music genres
     */
    constructor(name, musicBrainzId, gender, musicBrainzName, musicBrainzSortName, genres = [], aliases = []) {
        this.name = name;
        this.musicBrainzId = musicBrainzId;
        this.aliases = aliases;
        this.gender = gender;
        this.genres = genres;
        this.musicBrainzName = musicBrainzName;
        this.musicBrainzSortName = musicBrainzSortName;
    }

}

module.exports = Artist;
