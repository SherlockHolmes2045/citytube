const { DataTypes } = require('sequelize');
const sequelize = require('../service/db').sequelize;

const CrawlProgress = sequelize.define('CrawlProgress', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
       autoIncrement: true,
    },
    lastMessageId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'last_message_id',
    },
    albumParsed: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'album_parsed',
    },
}, {
    tableName: 'crawl_progress',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = CrawlProgress;
