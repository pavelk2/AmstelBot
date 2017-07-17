var moduletitle = 'context';

DIALOGUE_POSSIBLE_STATES = {
    "small talk": {
        "entities" : {}
    },
    "restaurants": {
        "entities": {
            "category": {
                "type": "list",
                "examples": ["Pasta","Sandwich","Bar", "Chinese restaurant"]
            },
            "location":{
                "type": "location",
                "examples": []
            }
        }
    }
}

CURRENT_STATE = {
    "intent": "restaurants",
    "entities": {},
    "results_provided":false,
    "expecting": undefined
}

var Context = function(user){
    this.user = user;
    this.state = CURRENT_STATE
}

Context.prototype = {
    getPossibleStates: function(){
        return Object.keys(DIALOGUE_POSSIBLE_STATES);
    },
    setState: function(intent){
        var context = this;
        if (context.getPossibleStates().indexOf(intent) > -1){
                context.state.intent = intent;
        }
        return context;
    },
    getState: function(){
        return this.state.intent;
    },
    getMissingEntities: function(){
        var MissingEntities = {}, context = this;
        Object.keys(DIALOGUE_POSSIBLE_STATES[context.state.intent]["entities"]).forEach(function(entity_name){
            if (!(entity_name in context.state.entities)){
                MissingEntities[entity_name] = DIALOGUE_POSSIBLE_STATES[context.state.intent]["entities"][entity_name]
            } 
        });
        return MissingEntities;
    },
    setEntity: function(entity, value){
        var context = this;
        context.state.entities[entity] = value;
    },
    cleanState: function(){
        this.state = CURRENT_STATE;

    },
    cleanEntity: function(entity){
        var context = this;
        delete context.state.entities[entity]
    },
    setExpectation: function(entity){
        var context = this;
        context.state.expecting = entity;
    },
    getExpectataion: function(){
        var context = this;
        return context.state.expecting;
    }
}


module.exports = Context