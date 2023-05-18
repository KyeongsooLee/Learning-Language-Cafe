const Sequelize = require('sequelize');
require('dotenv').config()

var sequelize = new Sequelize(process.env.POSTGRESQL_DATABASE, process.env.POSTGRESQL_USERNAME, process.env.POSTGRESQL_PASSWORD, {
    host: process.env.POSTGRESQL_HOSTNAME,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: { rejectUnauthorized: false }
    },
    query: { raw: true},
});


const Article = sequelize.define('Article', {
    articleId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    articleTitle: Sequelize.STRING,
    articleContent: Sequelize.TEXT,
});

module.exports.initialize = function() {
    return new Promise(function (resolve, reject) {
        sequelize.sync()    
        .then(() => {  
            console.log("Database synchronization successful");
            resolve("resolved successfully");  
        })
        .catch((error) => {  
            console.log("Database synchronization error:", error);
            reject("unable to sync the database");
        });
    });
};

module.exports.getArticles = function() {
    return new Promise(function (resolve, reject) {
        Article.findAll()
        .then((data) => {
            resolve(data);
        })
        .catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.addArticle = function (articleData) {
    return new Promise(function (resolve, reject) {
        for (const prop in articleData) {
            if (articleData[prop] == "")
                articleData[prop] = null;
        };
        articleData.articleContent = articleData.articleContent.replace(/\n/g, "<br>");
        Article.create({
            articleId: articleData.articleId,
            articleTitle: articleData.articleTitle,
            articleContent: articleData.articleContent,
        })
        .then(() => {
            resolve("New article created successfully");
        })
        .catch(() => {
            reject("unable to create article");
        });
    });
};

module.exports.getArticleById = function (id) {
    return new Promise(function (resolve, reject) {
        Article.findAll({ 
            where: {
                articleId: id
            }
        })
        .then((data) => {
            resolve(data[0]);
        })
        .catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.getUpdateArticleById = function (id) {
    return new Promise(function (resolve, reject) {
        Article.findAll({ 
            where: {
                articleId: id
            }
        })
        .then((articles) => {
            const articleData = articles[0];
            if (articleData) {
                articleData.articleContent = articleData.articleContent.replace(/<br>/g, "\n");
                resolve(articleData);
            } else {
                reject("no results returned");
            }
        })
        .catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.updateArticle = function (articleData) {
    return new Promise(function (resolve, reject) {
        for (const prop in articleData) {
            if (articleData[prop] == "")
                articleData[prop] = null;
        };
        articleData.articleContent = articleData.articleContent.replace(/\n/g, "<br>");
        Article.update({
            articleId: articleData.articleId,
            articleTitle: articleData.articleTitle,
            articleContent: articleData.articleContent,
        },
        {
            where: {
                articleId: articleData.articleId
            }
        })
        .then(() => {
            resolve("Article updated successfully");
        })
        .catch(() => {
            reject("unable to update article");
        });
    });
};

module.exports.deleteArticleById = function (id) {
    return new Promise(function (resolve, reject) {
        Article.destroy({    
            where: {                
                articleId: id
            }        
        })        
        .then(() => {  
            resolve("destroyed");
        })
        .catch(() => {
            reject("Unable to delete article.");
        });
    });
};