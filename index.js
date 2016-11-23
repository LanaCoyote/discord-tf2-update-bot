// TF2 Update Bot
// Sends a message to some Discord servers whenever a TF2 update is released
//
// Created: 11/23/16 17:07
// Last Update: 11/23/16 17:07
// Author: Lana

const config = require( './config.json' );
const discordBot = require( './controllers/bot.controller' );

discordBot.initBot(config.BOT_TOKEN)
  .then( bot => {
    discordBot.sendMessageToAllChannels( "I am here" );
  });
