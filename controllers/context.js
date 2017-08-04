var moduletitle = 'context',
    Operations = require('./operations');

GOOGLE_STATIC_MAPS_KEY = process.env.GOOGLE_STATIC_MAPS_KEY;

DIALOGUE_POSSIBLE_STATES = {
    "custom request": {
        "entities": {
            "request": {
                "question": "What would you like?",
                "type": "string",
                "examples": []
            },
            "reason": {
                "question": "I do not know yet how to do that, but I will learn soon. Would you mind telling me, why this is important or interesting for you?",
                "type": "string",
                "examples": []
            }
        }
    },
    "popular place": {
        "entities": {}
    },
    "popular pictures": {
        "entities": {}
    },
    "place to eat": {
        "entities": {
            "category": {
                "question": "What kind of place are you looking for?",
                "type": "list",
                "examples": ["Street food", "Italian", "Chinese"]
            },
            "location": {
                "question": "Choose a location where I should search:",
                "type": "location",
                "examples": []
            }
        }
    }
}

CURRENT_STATE = {
    "intent": false,
    "entities": {},
    "results_provided": false,
    "expecting": false
}

var Context = function(user) {
    this.user = user;
    this.state = user.state;
    if (!("entities" in this.state)) {
        this.state["entities"] = {};
    }
}

Context.prototype = {
    getPossibleIntents: function() {
        return Object.keys(DIALOGUE_POSSIBLE_STATES);
    },
    setIntent: function(intent) {
        var context = this;
        if (context.getPossibleIntents().indexOf(intent) > -1) {
            context.state.intent = intent;
        }
        //this.user.saveUserInfo();
        return context;
    },
    getIntent: function() {
        return this.state.intent;
    },
    getMissingEntities: function() {
        var MissingEntities = {},
            context = this;
        Object.keys(DIALOGUE_POSSIBLE_STATES[context.state.intent]["entities"]).forEach(function(entity_name) {
            if (!(entity_name in context.state.entities)) {
                MissingEntities[entity_name] = DIALOGUE_POSSIBLE_STATES[context.state.intent]["entities"][entity_name]
            }
        });
        console.log(MissingEntities);
        return MissingEntities;
    },
    setEntity: function(entity, value) {
        var context = this;
        entity_type = DIALOGUE_POSSIBLE_STATES[context.state.intent]["entities"][entity]["type"];
        if ((entity_type == "location" && typeof value === "object") || (typeof value === "string" && entity_type != "location")) {
            context.state.entities[entity] = value;
            context.user.saveUserInfo();
        }
    },
    cleanState: function() {
        console.log("clean state")
        this.user.state = CURRENT_STATE;
        this.user.saveUserInfo();
    },
    cleanEntity: function(entity) {
        var context = this;
        delete context.state.entities[entity]
        this.user.saveUserInfo();
    },
    setExpectation: function(entity) {
        var context = this;
        console.log("expecting " + entity)
        context.state.expecting = entity;
        this.user.saveUserInfo();
    },
    getExpectataion: function() {
        var context = this;
        return context.state.expecting;
    },
    executeOperation: function(intent, entities, callback) {
        var context = this;
        switch (intent) {
            case "place to eat":
                context.user.sendSimpleMessage("let me see, what I can find for you 🔍...");
                var location = entities.location;
                var category = entities.category;

                context.user.getVenues(location, category, callback);
                break;
            case "popular pictures":
                context.user.sendSimpleMessage("I am looking for recent pictures on Instagram now ...")
                Operations.getPopularPhotos(function(popular_photos) {
                    var elements = [];
                    popular_photos.forEach(function(photo) {
                        elements.push({
                            "title": "Photo by " + photo["user"]["username"] + " (" + photo["likes"]["count"] + " likes)",
                            "subtitle": photo["location"]["name"],
                            "image_url": photo["images"]["standard_resolution"]["url"],
                            "default_action": {
                                "type": "web_url",
                                "url": photo["link"]
                            }
                        });
                    });
                    context.user.sendGenericMessage({
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": elements
                            }
                        }
                    }, callback);
                });
                break;
            case "popular place":
                context.user.sendSimpleMessage("I am checking now on social media the place with the most number of posts during the last hour. It might take up to 20 seconds ⏰ ...")
                Operations.getPopularPlaces(function(popular_places) {
                    var elements = [];
                    if (popular_places.length > 0) {
                        popular_places.forEach(function(place) {
                            var lat = place["input"]["lat"],
                                long = place["input"]["long"],
                                place_image = "https://maps.googleapis.com/maps/api/staticmap?center=" + lat + "," + long + "&markers=" + lat + "," + long + "&size=764x400&zoom=13&key=" + GOOGLE_STATIC_MAPS_KEY,
                                place_url = "https://www.google.nl/maps/@" + lat + "," + long + ",13z?hl=nl";
                            elements.push({
                                "title": 'Popular place',
                                "subtitle": place['output']['total'] + ' posts',
                                "image_url": place_image,
                                "default_action": {
                                    "type": "web_url",
                                    "url": place_url
                                }
                            });
                        });
                        context.user.sendGenericMessage({
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "generic",
                                    "elements": elements
                                }
                            }
                        }, callback);
                    } else {
                        context.user.sendSimpleMessage("😳 There was some problem and I could not find any popular place. Sorry 🤷", callback);
                    }
                });

                break;
            case "custom request":
                context.user.sendSimpleMessage("I appreciate your feedback! 🖖", callback);
                break;
            default:
                context.user.sendSimpleMessage(context.user.profile.first_name, " I am not sure what you were looking for 🤔", callback);
        }
    },
    sendIntro: function(callback) {
        var context = this;
        context.user.sendSimpleMessage("Hi "+context.user.profile.first_name+"!👋 We are researchers from Delft University of Technology 🇳🇱, working on a chatbot aiming to serve people at city-scale events, such as PRIDE 🏳️‍🌈.", function() {
            context.user.sendGenericMessage({
                "attachment": {
                    "type": "image",
                    "payload": {
                        "url": "https://habrastorage.org/web/76f/6c8/395/76f6c83952d6496d903e019c6d25577c.png"
                    }
                }
            }, function() {
                context.user.sendSimpleMessage("We want to learn from you 👂 what kind of information you would be interested in getting from such chatbot. You can express that by clicking 'custom request'.", callback);
            });
        });
    },
    processRequest: function(messageText, messageAttachments, callback) {
        var context = this;
        console.log(messageText);
        context.user.saveMessage(messageText, messageAttachments);
        if (messageText) {
            if (!(context.state.intent)) {
                context.setIntent(messageText);
            } else {
                var expectation = context.getExpectataion();
                if (expectation) {
                    context.setEntity(expectation, messageText);
                }
                context.setExpectation(false);
            }
            callback();
        } else if (messageAttachments) {
            if (messageAttachments[0] == "GET_STARTED_PAYLOAD"){
                context.sendIntro(callback);
            } else {
                callback();
                messageAttachments.forEach(function(attachment) {

                    switch (attachment.type) {
                        case 'location':
                            var title = attachment.title,
                                url = attachment.url,
                                lat = attachment.payload.coordinates.lat
                            long = attachment.payload.coordinates.long
                            context.setEntity("location", attachment.payload.coordinates);
                            break;
                        case 'image':
                            context.user.sendSimpleMessage("Wow! Nice picture :)");
                            break;
                        case 'audio':
                            context.user.sendSimpleMessage("Cool beats!");
                            break;
                        default:
                            context.user.sendSimpleMessage("I am not sure I can process such attachment.");
                    }

                });
            }
        }
    },
    createResponse: function() {
        var context = this;
        if (context.state.intent) {
            var missing_entities = context.getMissingEntities();
            if (Object.keys(missing_entities).length > 0) {
                context.requestEntities(missing_entities);
            } else {
                context.executeOperation(context.state.intent, context.state.entities, function() {
                    context.requestIntents();
                });
                context.cleanState();
            }
        } else {
            context.requestIntents();
        }

    },
    requestEntities: function(missing_entities) {
        var context = this;
        console.log(missing_entities);
        var entity = Object.keys(missing_entities)[0];
        if (entity == "user") {
            console.log(missing_entities);
        }
        context.setExpectation(entity)
        switch (missing_entities[entity]["type"]) {
            case "string":
                context.user.sendSimpleMessage(missing_entities[entity]["question"]);
                break;
            case "list":
                context.user.sendQuickReply(missing_entities[entity]["question"], missing_entities[entity]["examples"]);
                break;
            case "location":
                context.user.sendRequstLocation(missing_entities[entity]["question"]);
                break;
            default:
        }
    },
    requestIntents: function() {
        var context = this;
        context.user.sendQuickReply("What would you like me to find for you?", context.getPossibleIntents());
    }
}


module.exports = Context