var moduletitle = 'fluxedoAPI',
    request = require('request');

FLUXEDO_SUBSCRIPTION_ID = process.env.FLUXEDO_SUBSCRIPTION_ID
module.exports = {
    getPostCounter: function(lat = 52.359, long = 4.873, distance = 5000, period = 3600, callback) {
        var api = this,
            timenow = Date.now(),
            payload_data = {
                "subscription": FLUXEDO_SUBSCRIPTION_ID,
                "geo": {
                    "distance": distance,
                    "latitude": lat,
                    "longitude": long
                },
                "timeRange": {
                    "from": timenow - (period*1000),
                    "to": timenow
                }
            };
            console.log(payload_data)
        console.log("FLUXEDO: get post counter");
        api.callSendAPI("social/post/counter/", "POST", payload_data, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                return callback(body);
            } else {
                console.error("Failed calling Fluxedo API", response.statusCode, response.statusMessage, body.error);
            }
        });
    },
    callSendAPI: function(extension, requestTYPE, payload_data, callback) {
        request({
            uri: 'http://api.fluxedo.com/crowdinsights/' + extension,
            method: requestTYPE,
            json: payload_data
        }, callback);
    }
};