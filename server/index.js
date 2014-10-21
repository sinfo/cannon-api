var Hapi = require('hapi');
var options = require('server/options');
var config =require('config');
var log = require('server/helpers/logger');
var tokenSpan = new Date(config.token.expiration * 60 * 60 * 1000);

log.info('### Starting Cannon ###');

var db = require('./models');

var server = module.exports.hapi = new Hapi.Server(config.port);
module.exports.tokenSpan = tokenSpan;

server.pack.register([
  require('hapi-auth-bearer-token'),
  require('bell'),
  require('lout'),
  require('hapi-auth-basic'),
  { plugin: require('good'), options: options.log }],

  function (err) {

  if (err) {
    log.error({err: err},'[hapi-plugins] problem registering hapi plugins');
    return;
  }

  server.auth.strategy('facebook', 'bell', options.auth.facebook);
  server.auth.strategy('default', 'bearer-access-token', options.auth.default);
  server.auth.strategy('backup', 'basic', options.auth.backup);

  server.auth.default({
    strategies: ['backup', 'default'],
    mode: 'required'
  });

  server.start(function () {
    log.info('### Server started at: ' + server.info.uri + ' ###');
    require('server/resources');
    require('server/routes');
  });

});
