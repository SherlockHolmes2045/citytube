// musicbrainz.js


const parameters = {
    appName: process.env.MUSICBRAINZ_APP_NAME,
    appVersion: process.env.MUSICBRAINZ_APP_VERSION,
    appContactInfo: process.env.MUSICBRAINZ_APP_CONTACT,
}


/**
 * Search MusicBrainz by artist name
 * @param {string} artistName
 * @returns {Promise<Artist|null>} result object containing artist metadata
 */
async function searchArtistMetadata(artistName) {
    const { MusicBrainzApi } = await import('musicbrainz-api');
    const mbApi = new MusicBrainzApi(parameters);
    const artistSearch = await mbApi.search('artist', {
        query: artistName,
        country: 'JP',
    });

    const artist = artistSearch.artists.find((a) => a.country === 'JP') || artistSearch.artists[0];
    if (!artist) return null;

    const genres = artist.tags?.map((tag) => tag.name) || [];
    const sortNames = artist.aliases?.map((alias) => alias['sort-name']) || [];
    const names = artist.aliases?.map((alias) => alias.name) || [];

    const Artist = require('../model/artist');
    return new Artist(
        artistName,
        artist.id,
        artist.gender,
        artist.name,
        artist['sort-name'],
        genres,
        [...sortNames, ...names]
    );
}

/**
 * Search MusicBrainz by artist ID and album title
 * @param {string} artistId
 * @param {string} albumName
 * @returns {Promise<Object|null>} result object containing album metadata
 */
async function searchAlbumMetadata(artistId, albumName) {
    const { MusicBrainzApi } = await import('musicbrainz-api');
    const mbApi = new MusicBrainzApi(parameters);
    const albumSearch = await mbApi.search('release-group', {
        query: `release:${albumName} AND arid:${artistId}`,
        limit: 1,
    });

    const album = albumSearch['release-groups']?.[0];
    if (!album) return null;

    const genres = album.tags?.map((tag) => tag.name) || [];

    return {
        id: album.id,
        name: album.title,
        releaseDate: album['first-release-date'],
        genres,
    };
}

/**
 * Search for a recording by title and artist name
 * @param {string} title - The title of the song
 * @param {string} artistName - The name of the artist
 * @returns {Promise<Object|null>} the first matching recording result
 */
async function searchSong(title, artistName) {
    const { MusicBrainzApi } = await import('musicbrainz-api');
    const mbApi = new MusicBrainzApi(parameters);
    const result = await mbApi.search('recording', {
        query: `recording:"${title}" AND artist:${artistName}`,
    });
    return result.recordings?.[0] || null;
}

module.exports = {
    searchArtistMetadata,
    searchAlbumMetadata,
    searchSong,
};
