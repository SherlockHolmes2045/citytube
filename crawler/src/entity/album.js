const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Album = sequelize.define('Album', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cover: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        releaseDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'release_date',
        },
        musicBrainzId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'music_brainz_id',
        },
        musicBrainzName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'music_brainz_name',
        },
        messageId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'message_id',
        },
        genres: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
    }, {
        tableName: 'album',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    Album.associate = (entity) => {
        Album.belongsTo(entity.Artist, {
            foreignKey: 'artist_id',
            as: 'artist',
        });
        Album.hasMany(entity.Track, {
            foreignKey: 'album_id',
            as: 'tracks',
        });
    };

    return Album;
};
