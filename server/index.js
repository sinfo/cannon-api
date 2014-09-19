var Hapi         = require('hapi');
var options      = require('./options');
var cookieConfig = require('../config').cookie;
var port         = require('../config').port;
var log          = require('./helpers/logger');

log.error('### Starting Cannon ###');

require('./db');

var server = module.exports.hapi = new Hapi.Server(port, options);

server.pack.require('hapi-auth-cookie', function (err) {

  server.auth.strategy('session', 'cookie', {
    cookie: cookieConfig.name,
    password: cookieConfig.password,
    ttl: 2592000000,
    isSecure: false,
  });

  server.start(function () {
    log.info('Server started at: ' + server.info.uri);
    var routes = require('./routes');
  });

});
