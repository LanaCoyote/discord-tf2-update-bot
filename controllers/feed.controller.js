// Feed Controller
// Handles the RSS feed junk and provides us with an event emitter to run functions off
//
// Created: 11/23/16 17:53
// Last update: 12/23/16 19:01
// Author: Lana
'use strict';

const request = require( 'request' );
const EventEmitter = require( 'events' );
const FeedParser = require( 'feedparser' );
const Promise = require( 'bluebird' );

const Logger = require( '../util/logger' );

var G_parser;
var G_emitter;
var G_lastUpdate;
var G_url;

class FeedParserError extends Error {
  constructor( message ) {
    super( message );
    if ( this.message !== message ) this.message = message;
  }
}

function initFeed( url, options ) {
  G_emitter = new EventEmitter();

  return getLastUpdatePermalink( url ) 
    .then( guid => {
      G_url = url;
      G_lastUpdate = guid;

      return G_emitter;
    });
}

function getLastUpdatePermalink( url ) {
  var reader = new FeedParser();

  Logger.debug( "Getting last update from", url );
  return new Promise( ( ok,fail ) => {
    request( url )
      .on( 'response', res => {
        Logger.debug( url, ':', res.statusCode );
        if ( res.statusCode !== 200 ) return fail( new FeedParserError( "Bad status code received from feed" ) );
        res.pipe( reader );
      })
      .on( 'error', err => {
        return fail( err );
      });

    reader.once( 'readable', function() {
        var lastItem = this.read();
        Logger.debug( "Feed initialized starting from", lastItem.guid );
        ok( lastItem.guid );
      });
  });
}

function updateFeed() {
  Logger.debug( "Updating feed from", G_url );

  request( G_url )
    .on( 'response', res => {
      Logger.debug( G_url, ':', res.statusCode );
      if ( res.statusCode !== 200 ) throw new FeedParserError( "Bad status code received from feed" );
      var reader = new FeedParser();

      reader.once( 'readable', function() {
        var lastItem = this.read();
        if ( lastItem.guid === G_lastUpdate ) return;

        Logger.info( "New post found in RSS feed:", lastItem.guid );
        G_lastUpdate = lastItem.guid;
        G_emitter.emit( 'newPost', lastItem );
      });

      res.pipe( reader );
    })
    .on( 'error', err => {
      throw err;
    });
}

module.exports = {
  initFeed,
  updateFeed
};
