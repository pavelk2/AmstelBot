var moduletitle = 'facebookAPI',
    request = require('request');


var FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

module.exports = {
    sendMessage: function(messageData, callback = function(){}) {
        var api = this;
        
        api.callSendAPI("me/messages", "POST", messageData, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var recipientId = body.recipient_id;
                var messageId = body.message_id;

                if (messageId) {
                    console.log("Successfully sent message with id %s to recipient %s",
                        messageId, recipientId);
                } else {
                    console.log("Successfully called Send API for recipient %s",
                        recipientId);
                }
                callback();
            } else {
                console.error("Failed calling Facebook API", response.statusCode, response.statusMessage, body.error);
            }
        });
    },
    getProfile: function(userID, callback){
        var api = this;
        console.log("getting profile")
        api.callSendAPI(userID+"?fields=first_name,last_name,profile_pic,locale,timezone,gender", "GET", {}, function(error, response, body){
            console.log(response.statusCode)
            if (!error && response.statusCode == 200) {
                console.log(body);
                callback(body);
            } else {
                console.error("Failed calling Facebook API", response.statusCode, response.statusMessage, body.error);
            }
        })
    },
    callSendAPI: function(extension, requestTYPE, messageData, callback) {
        /*
         * Call the Send API. The message data goes in the body. If successful, we'll 
         * get the message id in a response 
         *
         */

        request({
            uri: 'https://graph.facebook.com/v2.6/'+extension,
            qs: {
                access_token: FACEBOOK_ACCESS_TOKEN
            },
            method: requestTYPE,
            json: messageData
        }, callback);
    }
};