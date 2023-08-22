const Sequelize = require('sequelize');
const sequelize = require('../config/postgresdb');

const IeltsSpeaking = sequelize.define('IeltsSpeaking', {
    ieltsSpeakingId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ieltsSpeakingTitle: Sequelize.STRING,
    ieltsSpeakingContent: Sequelize.TEXT,
});

module.exports = IeltsSpeaking;