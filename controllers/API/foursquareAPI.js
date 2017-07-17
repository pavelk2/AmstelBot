var moduletitle = 'foursquareAPI',
    request = require('request'),
    config = require('config')


CLIENT_ID = config.get("FOURSQUARE")['client_ID']
CLIENT_SECRET = config.get("FOURSQUARE")['client_secret']



module.exports = {
    getVenues: function(location, venue_query, callback) {
        var api = this;
        var extension = "venues/search" + "?ll="+location.lat+","+location.long+"&query="+encodeURI(venue_query)+"&limit=5";
        api.callSendAPI(extension, "GET", {}, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var venues = []
                console.log(body)
                body['response']['venues'].forEach(function(venue) {
                    console.log(venue);
                    venues.push({
                        id: venue.id,
                        title: venue.name,
                        subtitle: venue.location.address,
                        url: venue.url,
                        icon:  (venue.categories[0]) ? (venue.categories[0].icon.prefix + "bg_88"+venue.categories[0].icon.suffix) : ""
                    });
                });
                callback(venues);
            } else {
                console.error("Failed calling FourSquare API", response.statusCode, response.statusMessage, body.error);
            }
        });
    },
    getPhotos: function(venue_id, messageData, callback) {
        var api = this;
        var extension = "venues/" + venue_id + "/photos?";
        api.callSendAPI(extension, "GET", messageData, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var photos = []
                body.response.photos.items.forEach(function(photo) {
                    photos.push(photo.prefix + photo.width + "x" + photo.height + photo.suffix)
                });
                callback(photos);
            } else {
                console.error("Failed calling FourSquare API", response.statusCode, response.statusMessage, body.error);
            }
        });
    },
    callSendAPI: function(extension, requestTYPE, messageData, callback) {
        /*
         * Call the Send API. The message data goes in the body. If successful, we'll 
         * get the message id in a response 
         *
         */
        var uri = 'https://api.foursquare.com/v2/' + extension + "&v=20170101";
        console.log(uri);
        request({
            uri: uri,
            qs: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            },
            method: requestTYPE,
            json: messageData
        }, callback);
    }
};