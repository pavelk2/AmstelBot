var firebase = require('firebase'),
    config = require('config');

FIREBASE_API_KEY = config.get("FIREBASE_API_KEY")
FIREBASE_DATABASE_URL = config.get("FIREBASE_DATABASE_URL")

var firebase_config = {
    apiKey: FIREBASE_API_KEY,
    databaseURL: FIREBASE_DATABASE_URL
};

firebase.initializeApp(firebase_config);


var FBase = function() {
    this.db = firebase.database();
    this.people = this.db.ref("people")
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
    }

}

module.exports = FBase