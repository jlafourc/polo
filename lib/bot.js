const { WebClient } = require('@slack/client');
const menu = require('./menu');
const map = require('lodash.map');
const axios = require('axios');
const cloneDeep = require('lodash.clonedeep');

const slackClientOptions = {};
if (process.env.SLACK_ENV) {
  slackClientOptions.slackAPIUrl = process.env.SLACK_ENV;
}

const number_icons = { 
  1: ":one:",
  2: ":two:",
  3: ":three:",
  4: ":four:",
  5: ":five:",
  6: ":six:",
  7: ":seven:",
  8: ":eight:",
  9: ":nine:",
}

const bot = {
  web: new WebClient(process.env.SLACK_BOT_TOKEN, slackClientOptions),
  orders: {},
  counter: 0,
  displayPoll(channelId, data) {
    const attachments = []
    var mainText = "";
    var needOption  = true;
    const options = [];
    const buttonsAttachments = [];
    const buttonsAttachmentTemplate = {
      color: '#5A352D',
      title: '',
      callback_id: 'order:start',
      actions: [],
    };
    var buttonsAttachment = cloneDeep(buttonsAttachmentTemplate);
    var currentOption;
    
    data.forEach((item) => {
      if (item.type === "option") {
        currentOption = item;
        currentOption.icon = { type: "icon" }
        options.push(currentOption);
        needOption = false;
      } else if (item.type === "icon" && needOption == false) {
        currentOption.icon = item;
        needOption = true;
      }
    });

    options.forEach((item, i) => {
      if (item.icon.src === undefined) {
        var number_icon = number_icons[i+1]
        if (number_icon === undefined) { number_icon = (i+1) + "." }
        item.icon.src = number_icon
      }
      mainText = mainText + item.icon.src + " " + item.src + "\n";
      buttonsAttachment.actions.push({
        name: 'start' + i,
        text: item.icon.src,
        type: 'button',
        value: i+1,
      })
      console.log((i+1)%5 == 1)
      if((i+1)%5 == 1) {
        buttonsAttachments.push(buttonsAttachment);
        buttonsAttachment = cloneDeep(buttonsAttachmentTemplate);
      }
    });

    const finalAttachments = []
    finalAttachments.push( {
      color: '#5A352D',
      title: 'Sondage',
      text: mainText,
    })
    buttonsAttachments.forEach((attachment) => finalAttachments.push(attachment));
    console.log(finalAttachments)
    this.web.chat.postMessage(channelId, 'Polo le poller.\n', {
      attachments: finalAttachments,
    });
  },
};

module.exports = bot;
