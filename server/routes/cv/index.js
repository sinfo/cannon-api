var server     = require('server').hapi;
var handlers   = require('./handlers');

server.route({
  method: 'GET',
  path: '/cv',
  config: handlers.list
});

server.route({
  method: 'GET',
  path: '/cv/{id}',
  config: handlers.get
});

server.route({
  method: 'GET',
  path: '/cv/me',
  config: handlers.getMe
});

server.route({
  method: ['PATCH','PUT'],
  path: '/cv/{id}',
  config: handlers.update
});

server.route({
  method: ['PATCH','PUT'],
  path: '/cv',
  config: handlers.updateMe
});

server.route({
  method: 'POST',
  path: '/cv',
  config: handlers.create
});

server.route({
  method: 'POST',
  path: '/cv/me',
  config: handlers.createMe
});

server.route({
  method: ['DELETE'],
  path: '/cv/{id}',
  config: handlers.remove
});