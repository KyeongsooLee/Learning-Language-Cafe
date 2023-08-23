const sequelize = require('../config/postgresdb');
const Article = require('./article');
const Record = require('./record');
const ShortStory = require('./shortStory');
const IeltsSpeaking = require('./ieltsSpeaking');

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