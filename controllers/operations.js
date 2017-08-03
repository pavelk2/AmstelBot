var requireStack = require('require-stack'),
instagramAPI = requireStack("./API/instagramAPI"),
fluxedoAPI = requireStack("./API/fluxedoAPI");

AMSTERDAM_CORNERS = {
    "TL": {
        "lat": 52.385374,
        "long": 4.852157
    },

    "BR": {
        "lat": 52.349165,
        "long": 4.942099
    }
}

var getPlaces = function(lat_steps, long_steps, corners) {
    var places = [],
        lat_step_size = (corners.TL.lat - corners.BR.lat) / (lat_steps - 1),
        long_step_size = (corners.TL.long - corners.BR.long) / (long_steps - 1);

    for (var i = 0; i < lat_steps; i++) {
        for (var j = 0; j < long_steps; j++) {
            places.push({
                "lat": corners.BR.lat + (lat_step_size * i),
                "long": corners.TL.long + (long_step_size * j)
            });
        }
    }
    return places;
}

AMSTERDAM_PLACES = getPlaces(7, 7, AMSTERDAM_CORNERS);

var goThroughStack = function(stack, outputs, operation, callback) {
    if (stack.length > 0) {
        var element = stack.pop()
        operation(element, function(output) {
            outputs.push({
                "output": output,
                "input": element
            });
            console.log(stack.length)
            return goThroughStack(stack, outputs, operation, callback)
        });

    } else {
        callback(outputs)
    }
}

module.exports = {
    getPopularPlaces: function(callback) {
        var places = AMSTERDAM_PLACES;

        var recursiveOperation = function(place, recursive_callback) {
            fluxedoAPI.getPostCounter(place.lat, place.long, 1000, 5 * 3600, recursive_callback);
        }
        goThroughStack(places, [], recursiveOperation, function(outputs) {
            outputs = outputs.sort(compareOutputTotal);
            popular_places = outputs.slice(0,3)
            callback(popular_places)
        });

    },
    getPopularPhotos: function(callback) {
        instagramAPI.getMedia(52.359, 4.873, function(photos){
            photos = photos.sort(compareLikes);
            popular_photos = photos.slice(0,3)
            callback(popular_photos);
        });
    }
}

function compareOutputTotal(a, b) {
    if (a["output"]["total"] < b["output"]["total"])
        return 1;
    if (a["output"]["total"] > b["output"]["total"])
        return -1;
    return 0;
}
function compareLikes(a, b) {
    if (a["likes"]["count"] < b["likes"]["count"])
        return 1;
    if (a["likes"]["count"] > b["likes"]["count"])
        return -1;
    return 0;
}