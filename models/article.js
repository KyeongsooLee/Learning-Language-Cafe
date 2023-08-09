const Sequelize = require('sequelize');
const sequelize = require('../config/postgresdb');

const Article = sequelize.define('Article', {
    articleId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    articleTitle: Sequelize.STRING,
    articleContent: Sequelize.TEXT,
});

module.exports = Article;