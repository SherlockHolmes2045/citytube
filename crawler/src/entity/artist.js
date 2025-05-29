const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    const Artist = sequelize.define('Artist', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        musicBrainzId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'music_brainz_id',
        },
        musicBrainzSortName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'music_brainz_sort_name',
        },
        musicBrainzName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'music_brainz_name',
        },
        aliases: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        genres: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
    }, {
        tableName: 'artist',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    Artist.associate = (models) => {
        Artist.hasMany(models.Album, {
            foreignKey: 'artist_id',
            as: 'albums',
        });
    };

    return Artist;
};
