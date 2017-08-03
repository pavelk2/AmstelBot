var Context = require("./context"),
    User = require("./user");


    

var Conversations = function(){
    var conversations = this;
    conversations.contexts = {}
}


Conversations.prototype = {

    addContext: function(user_id, context){
        var conversations = this;
        conversations.contexts[user_id] = context;
    },
    cleanContext: function(user_id){
        delete this.contexts[user_id];
    },
    getContext: function(user_id, callback){
        var conversations = this;
        if (!(user_id in conversations.contexts)){
            var user = new User(user_id)
            user.updateProfile(function(updated_user){
                var context = new Context(updated_user)
                conversations.addContext(user_id,context);
                conversations.getContext(user_id, callback);
            });
            
        }else{
            callback(conversations.contexts[user_id]);
        }   
    }

}

module.exports = Conversations