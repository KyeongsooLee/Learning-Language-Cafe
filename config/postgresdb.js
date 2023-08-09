const Sequelize = require('sequelize');
require('dotenv').config();

var sequelize = new Sequelize(process.env.POSTGRESQL_DATABASE, process.env.POSTGRESQL_USERNAME, process.env.POSTGRESQL_PASSWORD, {
    host: process.env.POSTGRESQL_HOSTNAME,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true },
});

module.exports = sequelize;