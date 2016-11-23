// Bot Controller
// Manages high level bot functionality
//
// Created: 11/23/16 16:50
// Last Update: 11/23/16 16:50
// Author: Lana
'use strict';

const discord = require( 'discord.io' );
const Promise = require( 'bluebird' );

const Logger = require( '../util/logger' );

var G_bot;

const ERR_NO_TOKEN = "No bot token provided";

class DiscordBotError extends Error {
  constructor(message) {
    super(message);
    if ( this.message !== message ) this.message = message;
  }
}

function initBot( token, options ) {
  options = options || {};
  if ( !token ) throw new DiscordBotError();
  var defaults = {
    token,
    autorun: true
  };

  return new Promise( ( ok, fail ) => {
    var readied = false;
    G_bot = new discord.Client( Object.assign( defaults, options ) );

    G_bot.on('err', err => {
      if ( !readied ) fail( err instanceof Object ? err : new DiscordBotError( err ) );
    });

    G_bot.on('ready', () => {
      if (!readied) {
        readied = true;
        ok(G_bot);
      }
    });
  });
}

function sendMessageToAllChannels( message ) {
  for ( let channelId in G_bot.channels ) {
    if ( 'text' === G_bot.channels[channelId].type ) {
      Logger.debug( "Sending message to channel:", channelId );
      G_bot.sendMessage({
        to: channelId,
        message
      });
    }
  }
}

module.exports = {
  initBot,
  sendMessageToAllChannels
};
