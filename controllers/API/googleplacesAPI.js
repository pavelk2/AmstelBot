var moduletitle = 'googleplacesAPI',
    request = require('request');


GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

function NestedFunction(api, stack, cards, callback) {
    if (stack.length > 0) {
        var place = stack.pop()

        api.getDetails(place.place_id, function(body) {
            cards.push({
                id: place.id,
                rating: place.rating,
                title: place.name,
                subtitle: place.vicinity,
                url: (body.website) ? body.website : body.url,
                icon: (place.photos && place.photos[0]) ? api.getPhoto(place.photos[0].photo_reference) : place.icon
            });
            NestedFunction(api, stack, cards, callback)
        });
    }else{
        console.log(cards);
        callback(cards);
    }
}

module.exports = {
    getPlaces: function(location, venue_query, callback) {
        var api = this;
        var extension = "nearbysearch/json?location=" + location.lat + "," + location.long + "&rankby=distance&type=restaurant&opennow=true&query=" + encodeURI(venue_query) + "&key=" + GOOGLE_API_KEY;

        api.callSendAPI(extension, "GET", {}, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var cards = []
                body = JSON.parse(body)["results"]
                console.log("===========")
                NestedFunction(api, body, cards, callback)

            } else {
                console.error("Failed calling Google Places API", response.statusCode, response.statusMessage, error, body);
            }
        });
    },
    getPhoto: function(photoreference) {
        return 'https://maps.googleapis.com/maps/api/place/' + "photo" + "?maxwidth=500&maxheight=500&photo_reference=" + photoreference + "&key=" + GOOGLE_API_KEY
    },
    getDetails: function(place_id, callback) {
        var api = this;
        var extension = "details/json?placeid=" + place_id + "&key=" + GOOGLE_API_KEY;

        api.callSendAPI(extension, "GET", {}, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var venues = []
                body = JSON.parse(body)["result"]
                callback(body);
            } else {
                console.error("Failed calling Google Places API", response.statusCode, response.statusMessage, error, body);
            }
        });

    },
    callSendAPI: function(extension, requestTYPE, messageData, callback) {
        /*
         * Call the Send API. The message data goes in the body. If successful, we'll 
         * get the message id in a response 
         *
         */
        var uri = 'https://maps.googleapis.com/maps/api/place/' + extension;
        console.log(uri);
        request({
            uri: uri,
            method: requestTYPE
        }, callback);
    }
};