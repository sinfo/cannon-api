var Hapi = require('hapi');
var options = require('./options');
var cookieConfig = require('../config').cookie;
var port = require('../config').port;
var log = require('./helpers/logger');

log.error('### Starting Cannon ###');

var db = require('./models');

var server = module.exports.hapi = new Hapi.Server(port, options.server);

server.pack.require('hapi-auth-hawk', function (err) {

  server.auth.strategy('session', 'hawk', {
    /*cookie: cookieConfig.name,
    password: cookieConfig.password,
    ttl: 2592000000,
    isSecure: false,*/
  });

  server.pack.register({
      plugin: require('good'),
      options: options.log
    }, function (err) {
       if (err) {
          log.error('[good] problem registering good', err);
          return;
       }
  });

  server.start(function () {
    log.info('Server started at: ' + server.info.uri);
    var routes = require('./routes');
  });

});
