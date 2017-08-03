var template = require('./outputtemplate'),
    facebookAPI = require('./API/facebookAPI'),
    Firebase = require('./API/firebaseAPI'),
    googleplacesAPI = require('./API/googleplacesAPI');

var User = function(id) {
    this.id = id;
    this.profile = {}
    this.state = {}
}
firebase = new Firebase()

SERVER_URL = process.env.serverURL

User.prototype = {
    init: function(callback) {
        var user = this;
        firebase.checkUser(user.id, function(exists) {
            if (exists) {
                firebase.getUserData(user.id, function(user_data) {
                    user.profile = user_data["profile"]
                    user.state = user_data["state"]
                    callback(user);
                });
            } else {
                user.updateProfile(function(updated_user) {
                    var user = updated_user;
                    user.state = {
                        "intent": false,
                        "entities": {},
                        "results_provided": false,
                        "expecting": false
                    }
                    user_data = {
                        "profile": user.profile,
                        "state": user.state
                    }
                    firebase.createUser(user.id, user_data, function() {
                        callback(user);
                    })
                });
            }
        });
    },
    saveUserInfo: function() {
        console.log("saving user data")
        var user = this;
        user_data = {
            "profile": user.profile,
            "state": user.state
        }
        firebase.updateUserData(user.id, user_data, function() {
           
        })
    },
    updateProfile: function(callback) {
        var user = this;
        facebookAPI.getProfile(this.id, function(profile_data) {
            user.setProfile(profile_data, callback);
        });
    },
    setProfile: function(profile_data, callback) {
        this.profile = profile_data;
        callback(this);
    },
    sendSimpleMessage: function(messageText) {
        var user = this;
        var messageData = {
            recipient: {
                id: user.id
            },
            message: {
                text: this.profile.first_name + ", " + messageText
            }
        };
        facebookAPI.sendMessage(messageData);
    },
    getVenues: function(location, category, callback) {
        var user = this;
        /*
         * Send a text message using the Send API.
         *
         */
        googleplacesAPI.getPlaces(location, category, function(places) {
            var cards = [];
            if (places.length == 0) {
                facebookAPI.sendMessage("did not find anything...");
            } else {
                places.forEach(function(place) {
                    var buttons_data = []
                    if (place.url) {
                        buttons_data.push({
                            type: "web_url",
                            url: place.url,
                            title: "open"
                        });
                    }
                    cards.push(template.getCard(place, buttons_data));
                });

                console.log(template.getGeneric(cards));
                var messageData = {
                    recipient: {
                        id: user.id
                    },
                    message: template.getList(cards)
                };
            }

            facebookAPI.sendMessage(messageData, callback);
        });
    },
    sendImageMessage: function() {
        var user = this;
        /*
         * Send an image using the Send API.
         *
         */
        var messageData = {
            recipient: {
                id: user.id
            },
            message: {
                attachment: {
                    type: "image",
                    payload: {
                        url: SERVER_URL + "/assets/rift.png"
                    }
                }
            }
        };

        facebookAPI.sendMessage(messageData);
    },
    sendRequstLocation: function(text) {
        var user = this;
        var messageData = {
            recipient: {
                id: user.id
            },
            message: {
                "text": text,
                "quick_replies": [{
                    "content_type": "location"
                }]
            }
        };

        facebookAPI.sendMessage(messageData);
    },
    sendButtonMessage: function() {
        var user = this;
        /*
         * Send a button message using the Send API.
         *
         */
        var messageData = {
            recipient: {
                id: user.id
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "This is test text",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/rift/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Trigger Postback",
                            payload: "DEVELOPER_DEFINED_PAYLOAD"
                        }, {
                            type: "phone_number",
                            title: "Call Phone Number",
                            payload: "+16505551234"
                        }]
                    }
                }
            }
        };

        facebookAPI.sendMessage(messageData);
    },
    sendQuickReply: function(question, answers) {
        var user = this;
        /*
         * Send a message with Quick Reply buttons.
         *
         */
        var quick_replies = []
        answers.forEach(function(answer) {
            quick_replies.push({
                "content_type": "text",
                "title": answer,
                "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
            })
        });
        var messageData = {
            recipient: {
                id: user.id
            },
            message: {
                text: question,
                quick_replies: quick_replies
            }
        };
        facebookAPI.sendMessage(messageData);
    },
    sendReadReceipt: function() {
        var user = this;
        /*
         * Send a read receipt to indicate the message has been read
         *
         */
        console.log("Sending a read receipt to mark message as seen");

        var messageData = {
            recipient: {
                id: user.id
            },
            sender_action: "mark_seen"
        };

        facebookAPI.sendMessage(messageData);
    },
    sendTypingOn: function() {
        var user = this;
        /*
         * Turn typing indicator on
         *
         */
        console.log("Turning typing indicator on");

        var messageData = {
            recipient: {
                id: user.id
            },
            sender_action: "typing_on"
        };

        facebookAPI.sendMessage(messageData);
    },
    sendTypingOff: function() {
        var user = this;
        /*
         * Turn typing indicator off
         *
         */
        console.log("Turning typing indicator off");

        var messageData = {
            recipient: {
                id: user.id
            },
            sender_action: "typing_off"
        };

        facebookAPI.sendMessage(messageData);
    },
    sendAccountLinking: function() {
        var user = this;
        /*
         * Send a message with the account linking call-to-action
         *
         */
        var messageData = {
            recipient: {
                id: user.id
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "Welcome. Link your account.",
                        buttons: [{
                            type: "account_link",
                            url: SERVER_URL + "/authorize"
                        }]
                    }
                }
            }
        };

        facebookAPI.sendMessage(messageData);
    }
}



module.exports = User