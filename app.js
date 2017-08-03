const
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request');

var MongoClient = require('mongodb').MongoClient,
  opbeat = require('opbeat').start({
    "appId": config.get("OPBEAT_APP_ID"),
    "organizationId": config.get("OPBEAT_ORGANIZATION_ID"),
    "secretToken": config.get("OPBEAT_SECRET_TOKEN")
  })


var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({
  verify: verifyRequestSignature
}));
app.use(express.static('public'));
app.use(opbeat.middleware.express())

const SERVER_URL = config.get("serverURL"),
FACEBOOK_APP_SECRET = config.get('FACEBOOK_APP_SECRET'),
FACEBOOK_ACCESS_TOKEN = config.get('FACEBOOK_ACCESS_TOKEN'),
FACEBOOK_VALIDATION_TOKEN = config.get('FACEBOOK_VALIDATION_TOKEN');


if (!(FACEBOOK_APP_SECRET && FACEBOOK_ACCESS_TOKEN && FACEBOOK_VALIDATION_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}


function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', FACEBOOK_APP_SECRET)
      .update(buf)
      .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

var webhook = require('./controllers/webhook');
app.use('/webhook', webhook);

var authorize = require('./controllers/authorize');
app.use('/authorize', authorize);


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;