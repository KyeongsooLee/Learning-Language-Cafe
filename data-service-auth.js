var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true,
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String,
    }],
    "readArticleCount": {
        "type": Number,
        "default": 0
    },
    "finishReadingArticles": [String],
    "favoriteArticles": [String],
    "level": {
        "type": Number,
        "default": 1
    },
    "exp": {
        "type": Number,
        "default": 0
    }
});

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(`mongodb+srv://${process.env.Mongoose_USERNAME}:${process.env.Mongoose_PASSWORD}@learninglanguagecafe.d8jekqe.mongodb.net/?retryWrites=true&w=majority`, {useNewUrlParser: true});
        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
             User = db.model("users", userSchema);
             resolve();
        });
    });
}

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(userData.password, salt, (err, hash) => {
                    if (err) {
                        reject("There was an error encrypting the password");
                    } else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if (err.code == 11000) {
                                reject("User Name already taken");
                            } else {
                                reject("There was an error creating the user: " + err);
                            }
                        });
                    }
                });
            });
        }
    });
}

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
        .then((users) => {
            bcrypt.compare(userData.password, users[0].password)
            .then((res) => {
                if (res === true) {
                    users[0].loginHistory.push({
                        dateTime: new Date().toString(),
                        userAgent: userData.userAgent,
                    });
                    User.updateOne(
                        { userName: userData.userName },
                        {$set: { loginHistory: users[0].loginHistory }})
                        .exec()
                        .then(() => {
                            resolve(users[0]);
                        })
                        .catch((err) => {
                            reject("There was an error verifying the user: " + err);
                        }
                    );
                }
                else {
                    reject("Incorrect Password for user: " + userData.userName);
                }
            });
        })   
        .catch(() => {
            reject("Unable to find user: " + userData.userName);
        });
    });
}


module.exports.updateMarkAsReadArticle = function (articleId, userData) {
    return new Promise((resolve, reject) => {
        addOrDeleteToUniqueArray(userData.finishReadingArticles, articleId);
        console.log("Level: ", userData.level, "Exp: ", userData.exp);
        let updatedUserData = increaseExp(userData.level, userData.exp);
        console.log("Level: ", updatedUserData.level, "Exp: ", updatedUserData.exp);
        console.log("Finish Reading Articles: ", userData.finishReadingArticles);
        userData.readArticleCount = printNumbers(userData.finishReadingArticles);
        User.updateMany(
            { userName: userData.userName },
            { $set: {
                readArticleCount: userData.readArticleCount, 
                finishReadingArticles: userData.finishReadingArticles,
                level: updatedUserData.level,
                exp: updatedUserData.exp
            }}
        )
        .exec()
        .then(() => {
            resolve(userData);
        })
        .catch((err) => {
            reject("There was an error updating the user: " + err);
        });
    });
}

module.exports.updateLikeArticle = function (articleId, userData) {
    return new Promise((resolve, reject) => {
        addOrDeleteToUniqueArray(userData.favoriteArticles, articleId);
        console.log("Liked: ", userData.favoriteArticles);
        User.updateOne(
            { userName: userData.userName },
            { $set: {
                favoriteArticles: userData.favoriteArticles
            }}
        )
        .exec()
        .then(() => {
            resolve(userData);
        })
        .catch((err) => {
            reject("There was an error updating the user: " + err);
        });
    });
}


function addOrDeleteToUniqueArray(array, number) {
    if (!array.includes(number)) {
      array.push(number);
    } else {
      const index = array.indexOf(number);
      if (index !== -1) {
        array.splice(index, 1);
      }
    }
}

function printNumbers(array) {
    var count = 0;
    for (var i = 0; i < array.length; i++) { count++; }
    console.log("Total number: ", count);
    return count;
}

function increaseExp(userLevel, userExp) {
    let newExp = userExp + 37;
    let newLevel = userLevel;
  
    if (newExp >= 100) {
      newExp = newExp - 100;
      newLevel = userLevel + 1;
    }
    
    return { level: newLevel, exp: newExp };
}