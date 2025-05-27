const { Client } = require('minio');
require("dotenv").config();


const minioClient = new Client({
    endPoint: 'localhost',
    port: process.env.MINIO_PORT,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

module.exports = minioClient;
