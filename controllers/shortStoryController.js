const ShortStory = require('../models/shortStory');

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