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
  channels: [`${process.env.TTV_CHANNEL}`, `xQc`, `dreamwastaken`, `aceu`, `summit1g`, `MOONMOON`, `yourragegaming`, `Darleeng`, `yayster`, `Topsonous`, `shroud`, `Flight23white`, `Vinesauce`, `Maximilian_DOOD`, `ShahZaM`, `TinaKitten`, `DiazBiffle`, `ChilledChaos`, `EsfandTV`, `PENTA`, `Scarra`, `scump`, `nl_Kripp`, `PROD`, `Foolish_Gamers`, `roflgator`, `sneakylol`, `iiTzTimmy`, `snuffy`, `Snip3down`, `AceTsuu`, `koil`, `sashagrey`, `iateyourpie`, `susu_jpg`, `TeeGrizzley`, `Natsumiii`, `robcdee`, `Saintone`, `AdrianaChechik_`, `Albralelie`, `Calebhart42`, `Murda`, `DatModz`, `PikameeAmano`, `supertf`, `Tectone`, `Dropped`, `hJune`, `OhTofu`, `Gosu`, `Ac7ionMan`, `robinsongz`, `Skermz`, `Sequisha`, `LilAggy`, `Spaceboy`, `jorbs`, `FrtingGlitter`, `sunsetgaiaASMR`, `Sanchovies`, `Quantum`, `HecticTKS`, `Aurateur`, `dakotaz`, `supcaitlin`, `Rogue`, `KatFires`, `BobRoss`, `Kenji`, `CrReaM`, `cdewx`, `Ohmwrecker`, `Lacari`, `physicalgamerz`, `Tigz`, `KarasMai`, `derrekow`, `CDNThe3rd`, `Rubee`, `DizzyKitten`, `Euriece`, `SunBaconRelaxer`, `Payo`, `Captainflowers22`, `itsHafu`, `BigIraq`, `Hotashi`, `Shotzzy`, `ash`, `Terroriser`, `Noko`, `Biotoxz_`, `Lourlo`, `keanelol`, `faxuty`, `Beaulo`, `LunaOni`, `BikeMan`, `Kxpture`, `Xlice`, `Jukeyz`, `tcTekk`, `Diddly`, `XenosysVex`, `eaJParkOfficial`], // NOTE: This is an array of channels you want the bot to join.
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
  activeUsers.forEach((activeUser) => {
    axios.get('http://localhost:5000/v1/points/lookup/' + activeUser)
      .then(response => {
        if (response['data'].length > 0) {
          // If user exists, add 10 points to their existing points.
          axios.patch('http://localhost:5000/v1/points/add/' + activeUser)
          .then(response => {
            
          }).catch(err => console.log(err))
        } else {
          // Otherwise, insert them into the table and give them 10 points.
          // NOTE: I'm fairly certain this POST is done badly and has room for improvement.  Just can't see it yet.
          axios.post('http://localhost:5000/v1/users/add/' + activeUser)
            .then(response => {
              
            }).catch(err => console.log(err))
        }
      }).catch(err => console.log(err))
  });
  // Clear active users array for the next round.
  activeUsers = [];
}, 60000);
