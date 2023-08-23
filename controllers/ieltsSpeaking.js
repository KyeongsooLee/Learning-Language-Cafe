const IeltsSpeaking = require('../models/ieltsSpeaking');

module.exports.getIeltsSpeaking = function() {
    return new Promise(function (resolve, reject) {
        IeltsSpeaking.findAll({
            order: [['ieltsSpeakingId', 'ASC']] // Sort ieltsSpeakings in ascending order by ieltsSpeakingId
        })
        .then((data) => {
            resolve(data);
        })
        .catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.addIeltsSpeaking = function (ieltsSpeakingData) {
    return new Promise(function (resolve, reject) {
        for (const prop in ieltsSpeakingData) {
            if (ieltsSpeakingData[prop] == "")
            ieltsSpeakingData[prop] = null;
        };
        ieltsSpeakingData.ieltsSpeakingContent = ieltsSpeakingData.ieltsSpeakingContent.replace(/\n/g, "<br>");
        IeltsSpeaking.create({
            ieltsSpeakingId: ieltsSpeakingData.ieltsSpeakingId,
            ieltsSpeakingTitle: ieltsSpeakingData.ieltsSpeakingTitle,
            ieltsSpeakingContent: ieltsSpeakingData.ieltsSpeakingContent,
        })
        .then(() => {
            resolve("New ieltsSpeaking created successfully");
        })
        .catch(() => {
            reject("unable to create ieltsSpeaking");
        });
    });
};

module.exports.getIeltsSpeakingById = function (id) {
    return new Promise(function (resolve, reject) {
        IeltsSpeaking.findAll({ 
            where: {
                ieltsSpeakingId: id
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

module.exports.getUpdateIeltsSpeakingById = function (id) {
    return new Promise(function (resolve, reject) {
        IeltsSpeaking.findAll({ 
            where: {
                ieltsSpeakingId: id
            }
        })
        .then((ieltsSpeakings) => {
            const ieltsSpeakingData = ieltsSpeakings[0];
            if (ieltsSpeakingData) {
                ieltsSpeakingData.ieltsSpeakingContent = ieltsSpeakingData.ieltsSpeakingContent.replace(/<br>/g, "\n");
                resolve(ieltsSpeakingData);
            } else {
                reject("no results returned");
            }
        })
        .catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.updateIeltsSpeaking = function (ieltsSpeakingData) {
    return new Promise(function (resolve, reject) {
        for (const prop in ieltsSpeakingData) {
            if (ieltsSpeakingData[prop] == "")
            ieltsSpeakingData[prop] = null;
        };
        ieltsSpeakingData.ieltsSpeakingContent = ieltsSpeakingData.ieltsSpeakingContent.replace(/\n/g, "<br>");
        IeltsSpeaking.update({
            ieltsSpeakingId: ieltsSpeakingData.ieltsSpeakingId,
            ieltsSpeakingTitle: ieltsSpeakingData.ieltsSpeakingTitle,
            ieltsSpeakingContent: ieltsSpeakingData.ieltsSpeakingContent,
        },
        {
            where: {
                ieltsSpeakingId: ieltsSpeakingData.ieltsSpeakingId
            }
        })
        .then(() => {
            resolve("IeltsSpeaking updated successfully");
        })
        .catch(() => {
            reject("unable to update IeltsSpeaking");
        });
    });
};

module.exports.deleteIeltsSpeaking = function (id) {
    return new Promise(function (resolve, reject) {
        IeltsSpeaking.destroy({    
            where: {                
                ieltsSpeakingId: id
            }        
        })        
        .then(() => {  
            resolve("destroyed");
        })
        .catch(() => {
            reject("Unable to delete IeltsSpeaking.");
        });
    });
};