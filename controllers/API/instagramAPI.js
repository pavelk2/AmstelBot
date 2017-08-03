var moduletitle = 'instagramAPI',
    request = require('request');

INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN

module.exports = {
    getMedia: function(lat = 52.359, long = 4.873, callback) {
        var api = this,
        extension = "media/search?",
        query="lat="+lat+"&lng="+long;

        api.callSendAPI(extension+query, "GET", {}, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                return callback(body["data"]);
            } else {
                console.error("Failed calling INSTAGRAM API", response.statusCode, response.statusMessage, body.error);
            }
        });
    },
    callSendAPI: function(extension, requestTYPE, payload_data, callback) {
        var url = 'https://api.instagram.com/v1/' + extension+"&access_token="+INSTAGRAM_ACCESS_TOKEN;
        console.log(url);
        request({
            uri: url,
            method: requestTYPE,
            json: payload_data
        }, callback);
    }
};