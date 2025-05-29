const CrawlProgress = require('../entity/CrawlProgress');
const {Artist, Album, Track, sequelize} = require("./db");

// Get last crawled message ID
async function getLastMessageId() {
    const progress = await CrawlProgress.findOne({
        order: [['id', 'DESC']],
    });
    return progress?.lastMessageId || 0;
}

// Update progress after processing each message
async function updateLastMessageId(messageId, albumParsed) {
    await CrawlProgress.upsert({
        //id: 1,
        lastMessageId: messageId,
        albumParsed: albumParsed
    });
}

// Add an artist
async function createArtistWithAlbumAndTracks(data) {

    return sequelize.transaction(async (t) => {
        // 1. Find or create the artist
        let artist = null;

        // Step 1: Try to find by musicBrainzId if provided
        if (data.artist.musicBrainzId) {
            artist = await Artist.findOne({
                where: {musicBrainzId: data.artist.musicBrainzId},
                transaction: t,
            });
        }

        // Step 2: If not found, try to find by name
        if (!artist) {
            artist = await Artist.findOne({
                where: {name: data.artist.name},
                transaction: t,
            });
        }

        // Step 3: If still not found, create the artist
        if (!artist) {
            artist = await Artist.create({
                name: data.artist.name,
                musicBrainzId: data.artist.musicBrainzId || null,
                musicBrainzSortName: data.artist.musicBrainzSortName || null,
                musicBrainzName: data.artist.musicBrainzName || null,
                aliases: data.artist.aliases || [],
                gender: data.artist.gender || null,
                genres: data.artist.genres || [],
            }, {transaction: t});
        }


        // 2. Create the album
        const [albumRecord, created] = await Album.findOrCreate({
            where: {messageId: data.messageId},
            defaults: {
                name: data.name,
                cover:
                data.cover,
                releaseDate:
                data.releaseDate,
                musicBrainzId:
                    data.musicBrainzId || null,
                musicBrainzName:
                    data.musicBrainzName || null,
                messageId:
                data.messageId,
                genres:
                    data.genres || [],
                artist_id:
                artist.id,
            },
            transaction: t
        });

        // 3. Create all tracks
        const trackRecords = await Promise.all(
            data.tracks.map(track =>
                Track.findOrCreate({
                    where: {messageId: track.messageId},
                    defaults: {
                        name: track.name,
                        storageId:
                        track.storageId,
                        musicBrainzId:
                            track.musicBrainzId || null,
                        musicBrainzName:
                            track.musicBrainzName || null,
                        messageId:
                        track.messageId,
                        album_id:
                        albumRecord.id
                    },
                    transaction: t
                },)
            )
        );

        return {
            artist: artist,
            album: albumRecord,
            tracks: trackRecords,
        };
    });
}


module.exports = {
    getLastMessageId,
    updateLastMessageId,
    createArtistWithAlbumAndTracks
};
