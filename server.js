const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded;

const config = require('./config.json');

const accountSid = config.accountSid;
const authToken = config.authToken;
const client = require('twilio')(accountSid, authToken);

const sound = 'http://164.132.103.232/mp3/rick.mp3';

const app = express();

// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));

app.post('/', (request, response) => {
  // Use the Twilio Node.js SDK to build an XML response
  const twiml = new VoiceResponse();

  /** helper function to set up a <Gather> */
  function gather() {
    const gatherNode = twiml.gather({ numDigits: 1 });
    gatherNode.say('For rick roll, press 1. For hacking facebook, press 2.');

    // If the user doesn't enter input, loop
    twiml.redirect('/');
  }

  // If the user entered digits, process their request
  if (request.body.Digits) {
    switch (request.body.Digits) {
      case '1':
        twiml.play({
            loop: 1
        }, sound);
        twiml.say('We have 50 % offer for rick rolls');
        gather();
        break;
      case '2':
        twiml.say('Hacking facebook is illegal, why are you asking that!');
        gather();
        break;
      default:
        twiml.say("Sorry, I don't understand that choice.").pause();
        gather();
        break;
    }
  } else {
    // If no input was sent, use the <Gather> verb to collect user input
    gather();
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});

// Create an HTTP server and listen for requests on port 3000
console.log('Twilio Client app HTTP server running at http://127.0.0.1:3000');
app.listen(3000);
