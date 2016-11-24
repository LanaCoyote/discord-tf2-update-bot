// Logger
// Logs messages, duh
//
// Created: 11/23/16 17:19
// Last update: 11/23/16 19:39
// Author: Lana
'use strict'

const chalk = require( 'chalk' );

const LOG_LEVELS = {
  error: { head: "ERROR", headColor: 'red', color: 'red', level: 0 },
  warning: { head: "WARNING", headColor: 'yellow', color: 'white', level: 1 },
  info: { head: "INFO", headColor: 'green', color: 'white', level: 2 },
  debug: { head: "DEBUG", headColor: 'blue', color: 'white', level: 3 }
};

var currentLogLevel = 3;

function log() {
  if ( currentLogLevel < this.level ) return;
  var argv = [].slice.call( arguments ).map( message => chalk[this.color]( message ) );
  argv.unshift( chalk[this.headColor]( '[' + this.head + ']' ) );
  argv.unshift( '[' + new Date().toLocaleTimeString() + ']' );
  console.log.apply( console, argv );
}

function setLogLevel( level ) {
  if ( level instanceof Object ) currentLogLevel = level.level;
  else currentLogLevel = level;
}

module.exports = {
  setLogLevel
}

for ( let level in LOG_LEVELS ) {
  module.exports[level] = log.bind( LOG_LEVELS[level] );
}
