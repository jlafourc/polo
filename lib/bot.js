const { WebClient } = require('@slack/client');
const cloneDeep = require('lodash.clonedeep');
const uuidv4 = require('uuid/v4');

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


function createPollFromData(data) {
  var needOption  = true;
  var needTitle = true;
  const poll = {
    options: []
  }
  var currentOption;
  data.forEach((item) => {
    if (item.type === "option") {
      if (needTitle) {
        poll.title = item.src;
        needTitle = false;
      } else {
        currentOption = item;
        currentOption.count = 0;
        currentOption.voters = [];
        currentOption.icon = { type: "icon" }
        poll.options.push(currentOption);
        needOption = false;
      }
    } else if (item.type === "icon" && needOption == false) {
      currentOption.icon = item;
      needOption = true;
    }
  });

  poll.id = uuidv4()

  return poll;
}




const bot = {
  web: new WebClient(process.env.SLACK_BOT_TOKEN, slackClientOptions),
  counter: 0,
  polls: {},
  displayPoll(channelId, data, username) {
    const poll = createPollFromData(data);
    poll.owner = username;
    const message = this.createMessageFromPoll(poll);
    
    this.web.chat.postMessage(channelId, '', message).then(mess => this.polls[mess.channel + "." + mess.ts] = poll);
  },
  createMessageFromPoll(poll) {
      
    var mainText = "";
    const buttonsAttachments = [];
    const buttonsAttachmentTemplate = {
      color: '#5A352D',
      title: '',
      callback_id: 'poll:vote',
      actions: [],
    };
    var buttonsAttachment = cloneDeep(buttonsAttachmentTemplate);
    buttonsAttachments.push(buttonsAttachment);
  
    poll.options.forEach((item, i) => {
      if (item.icon.src === undefined) {
        var number_icon = number_icons[i+1]
        if (number_icon === undefined) { number_icon = (i+1) + "." }
        item.icon.src = number_icon
      }
      mainText = mainText + item.icon.src + " " + item.src;
      if (item.voters.length > 0) {
        mainText = mainText + "  " + "`"+ item.voters.length + "`"
      }
      mainText = mainText + "\n";
      if (item.voters.length > 0) {
        mainText = mainText + item.voters.map(voter => "<@" + voter + ">").join(" ") + "\n";
      }
      buttonsAttachment.actions.push({
        name: 'start' + i,
        text: item.icon.src,
        type: 'button',
        value: i+1,
      })
      if((i+1)%5 == 0) {
        buttonsAttachment = cloneDeep(buttonsAttachmentTemplate);
        buttonsAttachments.push(buttonsAttachment);
      }
    });
  
    const finalAttachments = []
    finalAttachments.push( {
      color: '#5A352D',
      fields: [{
        title: poll.title,
        value:  mainText,
      }]
    })
    buttonsAttachments.forEach((attachment) => finalAttachments.push(attachment));
    finalAttachments.push( {
      color: '#5A352D',
      callback_id: 'poll:delete',
      text: '',
      actions : [{
        name: 'delete',
        text: "Delete",
        type: 'button',
        value: "delete",
          "confirm": {
            "title": "Supprimer le sondage ?",
            "text" : "Vraiment ?",
            "ok_text": "Oui",
            "dismiss_text": "Non"
        }

      }]
    })
    const message = {
      attachments: finalAttachments,
    };
    return message;
  },
};

module.exports = bot;
