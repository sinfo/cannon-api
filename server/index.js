var Hapi = require('hapi');
var options = require('./options');
var cookieConfig = require('../config').cookie;
var port = require('../config').port;
var log = require('./helpers/logger');
var getCredentials = {}; // require('./auth/credentialsFunc');

log.error('### Starting Cannon ###');

var db = require('./models');

var server = module.exports.hapi = new Hapi.Server(port);

// server.pack.require('hapi-auth-hawk', function (err) {

  // server.auth.strategy('session', 'hawk', function (err) {
  //   if (err) {
  //     log.error('[hawk] problem setting auth strategy', err);
  //     return;
  //   }
  //   server.auth.strategy('default', 'hawk', { getCredentialsFunc: getCredentials });
  // });


  // server.pack.register({
  //     plugin: require('good'),
  //     options: options.log
  //   }, function (err) {
  //      if (err) {
  //         log.error('[good] problem registering good', err);
  //         return;
  //      }
  // });

  server.pack.register({ 
    plugin: require('lout') 
  }, function() {
    server.start(function () {
      log.info('### Server started at: ' + server.info.uri + ' ###');
      var routes = require('./routes');
    });
  });

// });
