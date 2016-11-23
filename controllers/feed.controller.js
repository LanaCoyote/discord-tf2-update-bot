// Feed Controller
// Handles the RSS feed junk and provides us with an event emitter to run functions off
//
// Created: 11/23/16 17:53
// Last update: 12/23/16 17:53
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
  G_parser = new FeedParser({});

  G_parser.on( 'error', err => {
    if ( err instanceof Error ) throw err;
    else throw new FeedParserError( err );
  });
  
  return getLastUpdatePermalink( url ) 
    .then( guid => {
      G_url = url;
      G_lastUpdate = guid;

      G_parser.on( 'readable', function() {
        var lastItem = this.read();
        if ( lastItem.guid === G_lastUpdate ) return;

        G_emitter.emit( 'newPost', lastItem );
      });

      return G_emitter;
    });
}

function getLastUpdatePermalink( url ) {
  return new Promise( ( ok,fail ) => {
    request( url )
      .on( 'response', res => {
        if ( res.statusCode !== 200 ) return fail( new FeedParserError( "Bad status code received from feed" ) );
        res.pipe( G_parser );
      })
      .on( 'error', err => {
        return fail( err );
      });

    G_parser
      .once( 'readable', function() {
        var lastItem = this.read();
        console.dir( lastItem );
        ok( lastItem.guid );
      });
  });
}

function updateFeed() {
  request( G_url )
    .on( 'response', res => {
      if ( res.statusCode !== 200 ) throw new FeedParserError( "Bad status code received from feed" );
      res.pipe( G_parser );
    })
    .on( 'error', err => {
      throw err;
    });
}

module.exports = {
  initFeed,
  updateFeed
};
