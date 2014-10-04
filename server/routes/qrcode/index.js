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