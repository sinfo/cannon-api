var server     = require('server').hapi;
var handlers   = require('./handlers');

server.route({
  method: 'GET',
  path: '/api/redeem',
  config: handlers.list
});

server.route({
  method: 'GET',
  path: '/api/redeem/{id}',
  config: handlers.get
});

server.route({
  method: ['PATCH','PUT'],
  path: '/api/redeem/{id}',
  config: handlers.update
});

server.route({
  method: 'POST',
  path: '/api/redeem',
  config: handlers.create
});
