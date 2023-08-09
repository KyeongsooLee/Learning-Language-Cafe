const Record = require('../models/record');

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