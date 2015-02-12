var Hapi = require('hapi');
var options = require('server/options');
var config =require('config');
var log = require('server/helpers/logger');

log.error({ env: process.env.NODE_ENV }, '### Starting Cannon ###');

var db = require('server/db');

var server = module.exports.hapi = new Hapi.Server(config.host, config.port, { cors: true });

server.pack.register([
  { plugin: require('hapi-swagger'), options: config.swagger },
  require('hapi-auth-bearer-token'),
  require('bell'),
  require('hapi-auth-basic')],
  //{ plugin: require('good'), options: options.log }],

  function (err) {

    if (err) {
      log.error({err: err},'[hapi-plugins] problem registering hapi plugins');
      return;
    }

    server.auth.strategy('default', 'bearer-access-token', options.auth.default);
    server.auth.strategy('backup', 'basic', options.auth.backup);

    require('server/resources');
    require('server/routes');

    if (!module.parent) {
      server.start(function () {
        log.info('### Server started at: ' + server.info.uri + ' ###');
      });
    }
  }
);
