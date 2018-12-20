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

slackMessages.action('poll:vote', (payload, respond) => {
  const updatedMessage = cloneDeep(payload.original_message);
  var answer = parseInt(payload.actions[0].value)
  var poll = bot.polls[payload.channel.id +  "." + updatedMessage.ts];
  var option = poll.options[answer-1];
  if (option.voters.includes(payload.user.name)) {
    option.count = option.count - 1;
    option.voters = option.voters.filter(voter => voter !== payload.user.name);
  } else {
    option.count = option.count + 1;
    option.voters.push(payload.user.name);
  }
  const message = bot.createMessageFromPoll(poll);
  updatedMessage.attachments[0].fields[0].value = message.attachments[0].fields[0].value;
  return updatedMessage;
});


slackMessages.action('poll:delete', (payload, respond) => {
  const updatedMessage = cloneDeep(payload.original_message);
  var poll = bot.polls[payload.channel.id +  "." + updatedMessage.ts];
  if (payload.user.name === poll.owner) {
    updatedMessage.attachments = [];
    updatedMessage.text = ":heavy_check_mark: Le sondage a été supprimé"
  }
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
  return tokenizer.tokenize(message.text + " ")
    .then((res) => bot.displayPoll(message.channel_id, res, message.user_name))
    .then(() => res.json("Vous venez de créer un sondage avec succès"))
    .catch(() => res.json("Je n'ai pas réussi à créer le sondage"))
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/slack/actions', slackMessages.expressMiddleware());
// Start the server
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
