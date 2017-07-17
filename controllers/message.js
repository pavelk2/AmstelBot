var moduletitle = 'message',
    request = require('request'),
    User = require('./user'),
    FourSquareAPI = require('./API/foursquareAPI'),
    Conversations = require('./conversations')

CONVERSE = new Conversations()

module.exports = {
    receivedMessage: function(event) {
        var messagging = this;
        /*
         * Message Event
         *
         * This event is called when a message is sent to your page. The 'message' 
         * object format can vary depending on the kind of message that was received.
         * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
         *
         * For this example, we're going to echo any text that we get. If we get some 
         * special keywords ('button', 'generic', 'receipt'), then we'll send back
         * examples of those bubbles to illustrate the special message bubbles we've 
         * created. If we receive a message with an attachment (image, video, audio), 
         * then we'll simply confirm that we've received the attachment.
         * 
         */

        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var message = event.message;
        console.log("------------")
        console.log(CONVERSE);

        CONVERSE.getContext(senderID, function(context) {
            console.log("Received message for user %d and page %d at %d with message:",
                senderID, recipientID, timeOfMessage);

            var isEcho = message.is_echo;
            var messageId = message.mid;
            var appId = message.app_id;
            var metadata = message.metadata;

            // You may get a text or attachment but not both
            var messageText = message.text;
            var messageAttachments = message.attachments;
            var quickReply = message.quick_reply;

            if (isEcho) {
                // Just logging message echoes to console
                console.log("Received echo for message %s and app %d with metadata %s",
                    messageId, appId, metadata);
                return context;
            } else if (quickReply) {
                var quickReplyPayload = quickReply.payload;
            }

            if (messageText) {
                if (context.state.results_provided){
                    context.cleanState()
                }else{
                    messagging.saveExpectedEntity(context, messageText)
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
            messagging.requestEntities(context, function(context){
                context.cleanState();
                return context;
            });
            return context;
        });
        
    },
    requestEntities: function(context, callback) {
        var missing_entities = context.getMissingEntities();
        if (Object.keys(missing_entities).length > 0) {
            var entity = Object.keys(missing_entities)[0];
            context.setExpectation(entity)
            switch (missing_entities[entity]["type"]) {
                case "list":
                    context.user.sendQuickReply("What kind of place are you looking for?", missing_entities[entity]["examples"]);
                    break;
                case "location":
                    context.user.sendRequstLocation("Pick a location where you want me to suggest you places");
                    break;
                default:
                    context.user.sendSimpleMessage("tell me " + entity + " of what you are looking for?");
            }
        } else {
            context.user.sendSimpleMessage("here are my suggestions:");
            var location = context.state.entities.location
            var category = context.state.entities.category


            context.user.getVenues(location, category, function(){
                callback(context)
            });
        }

    },
    saveExpectedEntity: function(context, value) {
        var expectation = context.getExpectataion();
        console.log(expectation);
        if (expectation) {
            context.setEntity(expectation, value);
            console.log(context.state);
        }
        context.setExpectation(undefined);
    },
    receivedDeliveryConfirmation: function(event) {
        /*
         * Delivery Confirmation Event
         *
         * This event is sent to confirm the delivery of a message. Read more about 
         * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
         *
         */
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var delivery = event.delivery;
        var messageIDs = delivery.mids;
        var watermark = delivery.watermark;
        var sequenceNumber = delivery.seq;

        if (messageIDs) {
            messageIDs.forEach(function(messageID) {
                console.log("Received delivery confirmation for message ID: %s",
                    messageID);
            });
        }

        console.log("All message before %d were delivered.", watermark);
    },
    receivedPostback: function(event) {
        /*
         * Postback Event
         *
         * This event is called when a postback is tapped on a Structured Message. 
         * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
         * 
         */
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfPostback = event.timestamp;

        // The 'payload' param is a developer-defined field which is set in a postback 
        // button for Structured Messages. 
        var payload = event.postback.payload;

        console.log("Received postback for user %d and page %d with payload '%s' " +
            "at %d", senderID, recipientID, payload, timeOfPostback);

        // When a postback is called, we'll send a message back to the sender to 
        // let them know it was successful
        sendTextMessage(senderID, "Postback called");
    },
    receivedMessageRead: function(event) {
        /*
         * Message Read Event
         *
         * This event is called when a previously-sent message has been read.
         * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
         * 
         */
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;

        // All messages before watermark (a timestamp) or sequence have been seen.
        var watermark = event.read.watermark;
        var sequenceNumber = event.read.seq;

        console.log("Received message read event for watermark %d and sequence " +
            "number %d", watermark, sequenceNumber);
    },
    receivedAccountLink: function(event) {
        /*
         * Account Link Event
         *
         * This event is called when the Link Account or UnLink Account action has been
         * tapped.
         * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
         * 
         */
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;

        var status = event.account_linking.status;
        var authCode = event.account_linking.authorization_code;

        console.log("Received account link event with for user %d with status %s " +
            "and auth code %s ", senderID, status, authCode);
    },
    receivedAuthentication: function(event) {
        // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
        // The developer can set this to an arbitrary value to associate the 
        // authentication callback with the 'Send to Messenger' click event. This is
        // a way to do account linking when the user clicks the 'Send to Messenger' 
        // plugin.
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfAuth = event.timestamp;
        var user = new User(senderID)


        var passThroughParam = event.optin.ref;

        console.log("Received authentication for user %d and page %d with pass " +
            "through param '%s' at %d", senderID, recipientID, passThroughParam,
            timeOfAuth);

        // When an authentication is received, we'll send a message back to the sender
        // to let them know it was successful.
        user.sendTextMessage("Authentication successful");
    }
};