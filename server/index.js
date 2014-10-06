var Hapi = require('hapi');
var options = require('server/options');
var config =require('config');
var log = require('server/helpers/logger');

log.error('### Starting Cannon ###');

var db = require('./models');

var server = module.exports.hapi = new Hapi.Server(config.port);

server.pack.register([
  require('hapi-auth-bearer-token'),
  require('bell'),
  require('lout'),
  { plugin: require('good'), options: options.log }],

  function (err) {

  if (err) {
    log.error({err: err},'[hapi-plugins] problem registering hapi plugins');
    return;
  }

  server.auth.strategy('facebook', 'bell', {
    provider: 'facebook',
    cookie: config.facebook.cookie,
    password: config.facebook.password,
    clientId: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret,
    isSecure: false, //while http only
    //ttl: should define ttl after
  });

  server.auth.strategy('default', 'bearer-access-token', options.auth);

  server.start(function () {
    log.info('### Server started at: ' + server.info.uri + ' ###');
    require('server/resources');
    require('server/routes');
  });

});
