var mongoose = require("mongoose");
const { userSchema } = require('../models/userModel.js');

let User; // to be defined on new connection (see initialize)

function initialize() {
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

module.exports = {
    initialize: initialize,
    User: User
};