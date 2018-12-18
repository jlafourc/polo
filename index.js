require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const slackInteractiveMessages = require('@slack/interactive-messages');
const normalizePort = require('normalize-port');
const cloneDeep = require('lodash.clonedeep');
const bot = require('./lib/bot');
const tokenizer = require('./lib/tokenizer');
const queryString = require("query-string")

// --- Slack Interactive Messages ---
const slackMessages =
  slackInteractiveMessages.createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN);

// Action handling

slackMessages.action('order:start', (payload, respond) => {
  bot.counter = bot.counter + 1
  // Create an updated message that acknowledges the user's action (even if the result of that
  // action is not yet complete).
  const updatedMessage = cloneDeep(payload.original_message);
  console.log(payload)
  updatedMessage.attachments[0].title = 'Counter : ' + bot.counter
  // The updated message is returned synchronously in response
  return updatedMessage;
});

// Create the server
const port = normalizePort(process.env.PORT || '3000');
const app = express();
const urlencodedParser = bodyParser.raw({
  type: "application/x-www-form-urlencoded",
  inflate: true,
  limit: "100kb"
})

app.use(bodyParser.json());
app.post('/', urlencodedParser, (req, res) => { 
  const message = queryString.parse(req.body.toString())
  console.log(message);
  tokenizer.tokenize(message.text + " ").then((res) => bot.displayPoll(message.channel_id, res))
  res.json(message.text)
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/slack/actions', slackMessages.expressMiddleware());
// Start the server
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
