var mongoose = require("mongoose");
var Schema = mongoose.Schema;

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
    "readShortStoryCount": {
        "type": Number,
        "default": 0
    },
    "finishReadingArticles": [String],
    "favoriteArticles": [String],
    "finishReadingShortStories": [String],
    "favoriteShortStories": [String],
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

module.exports = {
    userSchema: userSchema,
    User: User
};