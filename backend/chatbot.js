// Require node modules
// Make variables inside .env element available to project
require("dotenv").config();
// Use the Twich Messenger Interface
const tmi = require("tmi.js");
// Axios for http requests (need to become more familiar with NodeJS methods of doing this.)
const axios = require("axios");

// const dbService = require('./dbService')

// NOTE: These seem to just appear. Honestly not sure wtf is going on here.
const { raw } = require("tmi.js/lib/commands");
const { response } = require("express");

// Set global array to add active users to for point tracking and other metrics.
activeUsers = [];
messageCount = 0;

// NOTE: Set up the Twitch Messaging Interface package to connect to my bot account.
// Setup connection config
// These include the channel, username and password
const client = new tmi.Client({
  options: { debug: true, messagesLogLevel: "info" },
  connection: {
    reconnect: true,
    secure: true,
  },
  // Without identity the bot can only observe chat and cannot respond to commands.
  identity: {
    username: `${process.env.TTV_USERNAME}`,
    password: `oauth:${process.env.TTV_ACCESS}`,
  },
  channels: [`${process.env.TTV_CHANNEL}`, 'Trainwreckstv', 'loltyler1', 'BruceDropEmOff', 'aceu', 'summit1g', 'MOONMOON', 'tarik', 'moistcr1tikal', 'fuslie', 'DisguisedToast', 'shroud', 'daltoosh', 'Duke', 'Emiru', 'ToryLanez', 'LVNDMARK', 'Punz', 'koil', 'BigBossBoze', 'ShahZaM', 'willneff', 'Aydan', 'Jinnytty', 'nl_Kripp', 'MiaMetzMusic', 'DougDougW', 'inokiyan', 'DiazBiffle', 's0mcs', 'Topsonous', 'iateyourpie', 'Tectone', 'tuonto', 'miki', 'Zy0xxx', 'AnthonyZ', 'Gosu', 'GTAWiseGuy', 'QuarterJade', 'UberHaxorNova', 'roflgator', 'Dropped', 'robcdee', 'Nemu', 'fobm4ster', 'Whippy', 'ESL_CSGO', 'cyr', 'BobRoss', 'zwebackhd', 'Zoomaa', 'TheChief1114', 'boxbox', 'kyootbot', 'Euriece', 'Calebhart42', 'kkatamina', 'KYR_SP33DY', 'Rogue', 'Milk', 'supertf', 'Masayoshi', 'GamesDoneQuick', 'Sanchovies', 'Ac7ionMan', 'Skermz', 'Lysium', 'Saintone', 'RealzBlueWater', 'Xlice', 'DatModz', 'CallMeAgent00', 'dish', 'Hungrybox', 'erobb221', 'OhTofu', 'ConnorEatsPants', 'robinsongz', 'sunsetgaiaASMR', 'BigIraq', 'BurkeBlack', 'CDNThe3rd', 'MTashed', 'ATK', 'scoped', 'Aurateur', 'Jenz', 'LilAggy', 'Jessu', 'TFBlade', 'Umbra', 'Quantum', 'Sekapoko', 'DaddyDimmuTV', 'Becca_Qichmond', 'julien', 'MuTeX', 'Sequisha', 'itsHafu', 'AsmodaiTV', 'plaqueboymax', 'Lawlman', 'JOEYKAOTYK', 'LuckyChamu', 'Artosis', 'Payo'], // NOTE: This is an array of channels you want the bot to join.
});

// Connect to specified channel using the settings from config and log any errors to the console.
// TODO: Have errors get logged to an actual file.
client.connect().catch(console.error);
msgsPerMin = setInterval(() => {
  client.say('ergonyx', `${messageCount}`)
  messageCount = 0
}, 60000);
// Listen for messages sent by users in the specified channel(s)
client.on("message", (channel, tags, message, self) => {
  // Prevent the bot from responding to it's own messages.
  if (self) return;

  // Add user to the activeUsers array to reward with points.
  if (activeUsers.indexOf(tags.username) < 0) {
    activeUsers.push(tags.username);
  }
  messageCount++
  // Create a switch statement with some possible commands and their outputs
  // The input shall be converted to lowercase first
  // The outputs shall be in the chats
  chatMessage = message.toLowerCase();

  // NOTE: Start of commands.
  // If the first character in a message isn't an "!" then the bot doesn't really need to care about it.
  if (chatMessage[0] === "!") {
    chatParse = chatMessage.split(" ");
    if (chatParse[0] === "!help") {
      if (!chatParse[1]) {
        console.log(
          channel,
          `@${tags["display-name"]} !Commands will provide you a list of commands available to you.  You may use "!Help <command>" for help on individual commands.  Alternatively, you may also visit http://ergonyx.ca/chatcommands for documentation on commands.`
        );
      } else {
        switch (chatParse[1]) {
          case "commands":
            console.log(channel, `@${tags["display-name"]} `);
            break;
          case "top10":
            // Connect to SQL server
            axios.get("http://localhost:5000/v1/points/lookup/top10")
              .then(response => {
                console.log(response.data)
                response['data'].forEach((el) => {
                  console.log(el)
                })
              })
              .catch(error => console.log(error))
            break;
          default:
            console.log(
              channel,
              `@${
                tags["display-name"]
              } Unknown command: ${chatParse[1].toUpperCase()} Try using !Commands for a list of commands.`
            );
            break;
        }
      }
    }

    if (chatParse[0] === "!commands") {
      console.log(
        channel,
        `@${tags.username} Available commands are !Help, !Commands, !Points`
      );
    }

    if (chatParse[0] === "!points") {
      if (chatParse[1]) {
        query = chatParse[1].toLowerCase();
        // This will let users look up the points for other users.
        axios.get("http://localhost:5000/v1/points/lookup/" + query)
        .then(response => {
          if (response['data'].length > 0) {
            console.log(channel, `@${tags['display-name']}: ${response.data[0].name} has ${response.data[0].points} points.`)
          } else {
            console.log(channel, `@${tags['display-name']}: ${query} doesn't appear to have any points yet.`)
          }
        }).catch(err => {console.log(err)})
      } else {
        // Look up users points.
        axios.get("http://localhost:5000/v1/points/lookup/" + tags.username)
        .then(response => {
          if (response['data'].length > 0) {
            console.log(channel, `@${tags['display-name']}: You have ${response.data[0].points} points.`)
          } else {
            console.log(channel, `@${tags['display-name']}: You don't have any points yet.  You earn points by participating in the chat.`)
          }
        }).catch(err => {console.log(err)})
      }
    }

    // Big RPG community commands in here.  Maybe consider making this into a module and importing it from a separate file.
    if (chatParse[0] === "!rpg") {
      switch (chatParse[1]) {
        case "help":
          console.log(
            `Provide simple summary (<140 chars) and link to advanced docs on website.`
          );
          break;
        case "fight":
          console.log(
            `Create doUserFight() function to simulate a battle and return a string with relevant data.`
          );
          break;
        case "shop":
          // Select 5 random items.  These items can be bought for the next 30 minutes.  Users pay using bot points.  Maybe have limited quantities based on active chatters.
          console.log(
            `Do a shop command that randomly selects 5 items that everyone in chat can purchase for the next X minutes.`
          );
          break;
        default:
          break;
      }
    }
  }
});

// Interval to give active chatters 10 points every 10 minutes.
pointUpdater = setInterval(() => {
  // Cycle through active users and add points.
  axios.patch('http://localhost:5000/v1/points/batch', {activeUsers: activeUsers})
  .then(response => {
    console.log(response.config.data)
  }).catch(err => console.log(err))

  activeUsers = [];
}, 60000);
