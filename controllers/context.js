var moduletitle = 'context';

DIALOGUE_POSSIBLE_STATES = {
    "place to eat": {
        "entities": {
            "category": {
                "question":"What kind of place you are looking for?",
                "type": "list",
                "examples": ["Street food", "Italian", "Chinese"]
            },
            "location": {
                "question":"Choose a location where I should search:",
                "type": "location",
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
    "give feedback": {
        "entities": {}
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
        entity_type =  DIALOGUE_POSSIBLE_STATES[context.state.intent]["entities"][entity]["type"];
        if ((entity_type == "location" && typeof value === "object") || (typeof value === "string" &&  entity_type != "location")){
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
        console.log("expecting "+entity)
        context.state.expecting = entity;
        this.user.saveUserInfo();
    },
    getExpectataion: function() {
        var context = this;
        return context.state.expecting;
    },
    executeOperation: function(intent,entities, callback) {
        var context = this;
        switch (intent) {
            case "place to eat":
                context.user.sendSimpleMessage("here are my suggestions:");
                var location = entities.location;
                var category = entities.category;
                
                context.user.getVenues(location, category, callback);
                break;
            case "popular pictures":
                context.user.sendSimpleMessage("The pictures are:", callback);
                break;
            case "popular place":
                context.user.sendSimpleMessage("The popular place is:", callback);
                break;
            default:
                context.user.sendSimpleMessage("not sure what you were looking for...", callback);
        }
    },
    processRequest: function(messageText, messageAttachments) {
        var context = this;
        console.log(messageText);
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
        } else if (messageAttachments) {
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
    },
    createResponse: function() {
        var context = this;
        if (context.state.intent) {
            var missing_entities = context.getMissingEntities();
            if (Object.keys(missing_entities).length > 0) {
                context.requestEntities(missing_entities);
            } else {
                context.executeOperation(context.state.intent,context.state.entities, function(){
                    context.requestIntents();
                });
                context.cleanState();   
            }
        }else{
            context.requestIntents();
        } 
        
    },
    requestEntities: function(missing_entities) {
        var context = this;
        console.log(missing_entities);
        var entity = Object.keys(missing_entities)[0];
        if (entity == "user"){
            console.log(missing_entities);
        }
        context.setExpectation(entity)
        switch (missing_entities[entity]["type"]) {
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