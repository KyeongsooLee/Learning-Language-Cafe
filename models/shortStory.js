const Sequelize = require('sequelize');
const sequelize = require('../config/postgresdb');

const ShortStory = sequelize.define('ShortStory', {
    shortStoryId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    shortStoryTitle: Sequelize.STRING,
    shortStoryContent: Sequelize.TEXT,
});

module.exports = ShortStory;