var server     = require('../../index').hapi;
var handlers   = require('./handlers');
var validators = require('./validators');

server.route({
  method: 'GET',
  path: '/qrcode/{id}',
  config: {
    handler: handlers.generate,
    auth: false,
    validate: validators.generate
  }
});

server.route({
  method: 'GET',
  path: '/r/{id}',
  config: {
    handler: handlers.redirect,
    auth: false,
    validate: validators.redirect
  }
});