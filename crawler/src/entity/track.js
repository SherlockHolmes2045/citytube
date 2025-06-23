const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    const Track = sequelize.define('Track', {
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
    }, {
        tableName: 'track',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    Track.associate = (models) => {
        Track.belongsTo(models.Album, {
            foreignKey: 'album_id',
            as: 'album',
        });
    };

    return Track;
};
