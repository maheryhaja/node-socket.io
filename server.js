'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

var bodyParser = require('body-parser')
var request = require('request');

var app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const server = app
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);


var log = "Application Log: ";
var senderID ="1517502958270862";


var observers = [];

function notifierNouveauMessage(name, data){
  //for(observer of observers)
  for(var i=0; i<observers.length;i++)
    observers[i].emit(name, data);
}

io.on('connection',function(socket) {

  //observers = [];
  observers.push(socket);
  console.log(observers.length);


  console.log("nouvelle connexion");

  socket.on("reponse", function(data){
    log = "receive message from client";
    sendTextMessage(senderID, data);
  });

});

app.post("/notifier", function(req, res) {
  notifierNouveauMessage("notification", req.body);
  res.send("ok");
});


app.get("/bonjour",  function(req, res){
  // receivedMessage({message:"mety tsaraaaaa"});
  return res.send("ton programme fonctionne correctement   ****"+observers.length+ "<br>"+log);


});

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'EAACRZAKKhUjEBABM4586uSpS6UasADXnve1Ls5KfWsHYuUnpFAKR5mjWfwxbtFv2xcAxXitvDavZCf0XWopVOJRPXmV4OyPSxJarvvuYZAHwKmssbohGfMOo59rGaw86LkfsKXlYDN5XhUuIzcZAVZBhYZCuefQPjFAWJTv8GkBQZDZD' ) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);

  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;



  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
      log = "all good "
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  // Putting a stub for now, we'll expand it in the following steps

  senderID = event.sender.id;
  log = "Sender id: " + senderID + " ";
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;


  console.log("Message data: ", event.message);


  notifierNouveauMessage("message", {
    message: event.message,
    senderID: senderID
  });

    log = "last message" + event.message;

}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  log = "try to send message";
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: "EAAHdZCoHq2T8BAMC7HYixhJnpPB5UCjSC2ZC0Mmtdqs3IIIf39a49mB8f4o0VaOzadT2cHE2YW3OdO3mbdGZAZCp0pHv1ohyszWiFekCdXbOZCog8ZAmLNwTGDZBAQUlMZAF1kYPUw2n0keP0MktkDfElrx4y7FSXRMXrZAjwKKRI6wZDZD" },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {

    log+="callback ";
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;
      log ="nety uhannnn ";
      console.log("Successfully sent generic message with id %s to recipient %s",
          messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      log  ="impossible ";
      console.error(response);
      console.error(error);
    }
  });


}




