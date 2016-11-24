// TF2 Update Bot
// Sends a message to some Discord servers whenever a TF2 update is released
//
// Created: 11/23/16 17:07
// Last Update: 11/23/16 19:55
// Author: Lana
'use strict';

const Promise = require( 'bluebird' );

const config = require( './config.json' );
const discordBot = require( './controllers/bot.controller' );
const feedReader = require( './controllers/feed.controller' );

const Logger = require( './util/logger' );

Logger.setLogLevel( config.LOG_LEVEL );

Promise.join(
    discordBot.initBot( config.BOT_TOKEN ),
    feedReader.initFeed( config.FEED_URL ) )
  .spread( function( bot, feed ) {
    feed.on( 'newPost', item => {
      if ( item.title === "Team Fortress 2 Update Released" ) {
        let cleanMessage = item.description.replace(/<li>/g, ' - ').replace(/<.+>/g, '');
        discordBot.sendMessageToAllChannels( cleanMessage );
      }
    });

    setInterval( feedReader.updateFeed, config.POLL_TIME || 900000 );
    Logger.info( "Polling for new posts on", config.FEED_URL, "..." );
  });
