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

const ShortStory = sequelize.define('ShortStory', {
    shortStoryId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    shortStoryTitle: Sequelize.STRING,
    shortStoryContent: Sequelize.TEXT,
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
        Article.findAll({
            order: [['articleId', 'ASC']] // Sort articles in ascending order by articleId
        })
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

module.exports.getRecords = function() {
    return new Promise(function (resolve, reject) {
        Record.findAll({
            order: [['recordId', 'ASC']] // Sort articles in ascending order by recordId
        })
        .then((data) => {
            resolve(data);
        })
        .catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.addRecord = function (recordData, userData) {
    return new Promise(function (resolve, reject) {
        for (const prop in recordData) {
            if (recordData[prop] == "")
                recordData[prop] = null;
        };
        recordData.recordContent = recordData.recordContent.replace(/\n/g, "<br>");
        Record.create({
            recordId: recordData.recordId,
            recordTitle: recordData.recordTitle,
            recordContent: recordData.recordContent,
            userName: userData.userName,
        })
        .then(() => {
            resolve("New record created successfully");
        })
        .catch(() => {
            reject("unable to create record");
        });
    });
};

module.exports.getRecordById = function (id) {
    return new Promise(function (resolve, reject) {
        Record.findAll({ 
            where: {
                recordId: id
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

module.exports.getUpdateRecordById = function (id) {
    return new Promise(function (resolve, reject) {
        Record.findAll({ 
            where: {
                recordId: id
            }
        })
        .then((records) => {
            const recordData = records[0];
            if (recordData) {
                recordData.recordContent = recordData.recordContent.replace(/<br>/g, "\n");
                resolve(recordData);
            } else {
                reject("no results returned");
            }
        })
        .catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.updateRecord = function (recordData) {
    return new Promise(function (resolve, reject) {
        for (const prop in recordData) {
            if (recordData[prop] == "")
                recordData[prop] = null;
        };
        recordData.recordContent = recordData.recordContent.replace(/\n/g, "<br>");
        Record.update({
            recordId: recordData.recordId,
            recordTitle: recordData.recordTitle,
            recordContent: recordData.recordContent,
        },
        {
            where: {
                recordId: recordData.recordId
            }
        })
        .then(() => {
            resolve("Record updated successfully");
        })
        .catch(() => {
            reject("unable to update Record");
        });
    });
};

module.exports.deleteRecordById = function (id) {
    return new Promise(function (resolve, reject) {
        Record.destroy({    
            where: {                
                recordId: id
            }        
        })        
        .then(() => {  
            resolve("destroyed");
        })
        .catch(() => {
            reject("Unable to delete record.");
        });
    });
};

module.exports.getShortStories = function() {
    return new Promise(function (resolve, reject) {
        ShortStory.findAll({
            order: [['shortStoryId', 'ASC']] // Sort articles in ascending order by articleId
        })
        .then((data) => {
            resolve(data);
        })
        .catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.addShortStory = function (shortStoryData) {
    return new Promise(function (resolve, reject) {
        for (const prop in shortStoryData) {
            if (shortStoryData[prop] == "")
            shortStoryData[prop] = null;
        };
        shortStoryData.shortStoryContent = shortStoryData.shortStoryContent.replace(/\n/g, "<br>");
        ShortStory.create({
            shortStoryId: shortStoryData.shortStoryId,
            shortStoryTitle: shortStoryData.shortStoryTitle,
            shortStoryContent: shortStoryData.shortStoryContent,
        })
        .then(() => {
            resolve("New article created successfully");
        })
        .catch(() => {
            reject("unable to create article");
        });
    });
};

module.exports.getShortStoryById = function (id) {
    return new Promise(function (resolve, reject) {
        ShortStory.findAll({ 
            where: {
                shortStoryId: id
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

module.exports.getUpdateShortStoryById = function (id) {
    return new Promise(function (resolve, reject) {
        ShortStory.findAll({ 
            where: {
                shortStoryId: id
            }
        })
        .then((shortStories) => {
            const shortStoryData = shortStories[0];
            if (shortStoryData) {
                shortStoryData.shortStoryContent = shortStoryData.shortStoryContent.replace(/<br>/g, "\n");
                resolve(shortStoryData);
            } else {
                reject("no results returned");
            }
        })
        .catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.updateShortStory = function (shortStoryData) {
    return new Promise(function (resolve, reject) {
        for (const prop in shortStoryData) {
            if (shortStoryData[prop] == "")
            shortStoryData[prop] = null;
        };
        shortStoryData.shortStoryContent = shortStoryData.shortStoryContent.replace(/\n/g, "<br>");
        ShortStory.update({
            shortStoryId: shortStoryData.shortStoryId,
            shortStoryTitle: shortStoryData.shortStoryTitle,
            shortStoryContent: shortStoryData.shortStoryContent,
        },
        {
            where: {
                shortStoryId: shortStoryData.shortStoryId
            }
        })
        .then(() => {
            resolve("ShortStory updated successfully");
        })
        .catch(() => {
            reject("unable to update ShortStory");
        });
    });
};

module.exports.deleteShortStory = function (id) {
    return new Promise(function (resolve, reject) {
        ShortStory.destroy({    
            where: {                
                shortStoryId: id
            }        
        })        
        .then(() => {  
            resolve("destroyed");
        })
        .catch(() => {
            reject("Unable to delete ShortStory.");
        });
    });
};