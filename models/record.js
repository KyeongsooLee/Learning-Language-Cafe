const Sequelize = require('sequelize');
const sequelize = require('../config/postgresdb');

const Record = sequelize.define('Record', {
    recordId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    recordTitle: Sequelize.STRING,
    recordContent: Sequelize.TEXT,
    userName: Sequelize.STRING,
});

module.exports = Record;