var server     = require('server').hapi;
var handlers   = require('./handlers');

server.route({
  method: 'GET',
  path: '/redeem',
  config: handlers.list
});

server.route({
  method: 'GET',
  path: '/redeem/{id}',
  config: handlers.get
});

server.route({
  method: ['PATCH','PUT'],
  path: '/redeem/{id}',
  config: handlers.update
});

server.route({
  method: 'POST',
  path: '/redeem',
  config: handlers.create
});
