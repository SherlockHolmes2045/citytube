const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
        host: process.env.PG_HOST || 'localhost',
        port: process.env.PG_PORT || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

const Artist = require('../entity/Artist')(sequelize);
const Album = require('../entity/Album')(sequelize);
const Track = require('../entity/Track')(sequelize);

// Associations
Artist.associate({ Album });
Album.associate({ Artist, Track });
Track.associate({ Album });

module.exports = {sequelize,Artist,Album,Track};
