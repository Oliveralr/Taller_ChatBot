'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  request = require('request'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

//PAGE_ACCESS_TOKEN = "EAADZC8apK3RUBAJD9rvLb8PsKcf5943zm9UFKU68Rq8IiZBLXcbzx5wsJt3ZCFRS4NYozPjay7uFENkjswMBBSbjnfxjWzCgKxtLGlt6sheMCrd4PxJfZCJrDoEKf3Mk5yrV7BZAncVZBs3huQIuzJIwLhxRMU1l92db3G0P2z9mCY4vAgLPRL"

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Handles messages events
    function handleMessage(sender_psid, received_message) {
      let response;
      
      // Checks if the message contains text
      if (received_message.text) {    
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        response = {
          "text": `¡Me has despertado!, mi nombre es "CJ", ¿Qué necesitas?`
        }

        let basic_hello = ["hola","Hola","hey","Hey","Buenas","buenas","que onda",
        "¿Qué onda?","¿qué onda?","que onda","hi","Hi","buen dia","buenas tardes",
        "buenas noches","Buenas Noches","Buenas Tardes","ayuda","ola","Ola","whatsup",
        "whats up","oye","Oye","oie","Oie"];

        if(received_message.text === "comprar"){

          response = {
            "message": {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "elements": [{
                    "title": "Te puedo ofrecer estas gafas de sol",
                    "subtitle": "$649.00",
                    "image_url": './public/img/gafas.jpg',
                    "buttons": [
                      {
                        "type": "postback",
                        "title": "Comprar",
                        "payload": "yes",
                      },
                      {
                        "type": "postback",
                        "title": "No me interesa",
                        "payload": "no",
                      }
                    ],
                  }]
                }
              }
            }
          }
        } 

      } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "generic",
              "elements": [{
                "title": "¿Está imágen es correcta?",
                "subtitle": "Presiona el botón para escoger",
                "image_url": attachment_url,
                "buttons": [
                  {
                    "type": "postback",
                    "title": "¡Sí!",
                    "payload": "yes",
                  },
                  {
                    "type": "postback",
                    "title": "Nel",
                    "payload": "no",
                  }
                ],
              }]
            }
          }
        }
      } 
      
      // Send the response message
      callSendAPI(sender_psid, response);    
    }

  // Handles messaging_postbacks events
      function handlePostback(sender_psid, received_postback) {

        let response;

        let payload = received_postback.payload;

        if(payload === 'yes'){
          response = {"text":"¡Cool!"}
        }
        else if(payload === 'no') {
          response = {"text":"Oops, envíala otra vez"}
        }

        callSendAPI(sender_psid, response)
      }

  // Sends response messages via the Send API
      function callSendAPI(sender_psid, response) {
        
        let request_body = {
          "recipient": {
            "id": sender_psid
          },
          "message": response
        }

        request({
          "uri": "https://graph.facebook.com/v2.6/me/messages",
          "qs": { "access_token": "EAADZC8apK3RUBADV6uDhSV563gXkkNIv57xnJCQMNZCptCrZAi7GqitRLtrvrvhRqOAOSPzZA7JTv2GPblxAHXVorZBlp3HTULvUSemdosyyq0PlW3y1TtfOzHZA1hyNAMsSBzM4h41Df8tZCSmLJVQj2ogEDZBjIrNb9099DLUy54641gdy3RSI" },
          "method": "POST",
          "json": request_body
          }, (err, res, body) => {
            if(!err){
              console.log("Message Sent!");
            } else {
              console.error("Unable to send message:" + err);
            }
        })
    }

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "gangster"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

//verify_token: gangster
//"localhost:1337/webhook?hub.verify_token=gangster&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"
//setting POST method: 
//curl -H "Content-Type: application/json" -X POST "localhost:1337/webhook" -d '{"object": "page", "entry": [{"messaging": [{"message": "IT WORKS"}]}]}'

//PAGE_ACCESS_TOKEN: EAADZC8apK3RUBADV6uDhSV563gXkkNIv57xnJCQMNZCptCrZAi7GqitRLtrvrvhRqOAOSPzZA7JTv2GPblxAHXVorZBlp3HTULvUSemdosyyq0PlW3y1TtfOzHZA1hyNAMsSBzM4h41Df8tZCSmLJVQj2ogEDZBjIrNb9099DLUy54641gdy3RSI