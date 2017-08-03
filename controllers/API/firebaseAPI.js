var firebase = require('firebase');

FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

var firebase_config = {
    apiKey: FIREBASE_API_KEY,
    databaseURL: FIREBASE_DATABASE_URL
};

firebase.initializeApp(firebase_config);


var FBase = function() {
    this.fb = firebase;
    this.db = this.fb.database();
    this.people = this.db.ref("people")
    this.messages = this.db.ref("messages")
}

FBase.prototype = {
    checkUser: function(user_id, callback) {
        console.log("check user")
        var fbase = this;
        fbase.people.child(user_id).once("value", function(snapshot) {
            var exists = snapshot.val() !== null
            console.log(exists);
            callback(exists);
        });
    },
    createUser: function(user_id, user_data, callback) {
        console.log("create user")
        var fbase = this,
            ref = fbase.getUserReference(user_id);
        ref.set(user_data)
        callback();
    },
    getUserData: function(user_id, callback) {
        console.log("get user data")
        var fbase = this,
            ref = fbase.getUserReference(user_id).once("value").then(function(snapshot) {
                var user_data = snapshot.val();
                callback(user_data)
            });
    },
    updateUserData: function(user_id, user_data, callback) {
        console.log("update user data")
        var fbase = this, ref = fbase.getUserReference(user_id).set(user_data).then(function(){
            callback();
        });
    },
    getUserReference: function(user_id){
        var fbas = this;
        return this.people.child(user_id)
    },
    addUserMessage: function(user_id, messageText,messageAttachments){
        var fbase = this;
        var ref = fbase.messages.child(user_id);
        message= (messageText) ? messageText :messageAttachments;
        console.log(message);
        ref.push({
            "message":message,
            dt:fbase.fb.database.ServerValue.TIMESTAMP
        })
    }

}

module.exports = FBase