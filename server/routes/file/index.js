var server = require('server').hapi;
var handlers = require('./handlers');

server.route({
  method: 'GET',
  path: '/api/file',
  config: handlers.list
});

server.route({
  method: 'GET',
  path: '/api/file/{id}',
  config: handlers.get
});

server.route({
  method: ['PUT','PATCH'],
  path: '/api/file/{id}',
  config: handlers.update
});

server.route({
  method: 'POST',
  path: '/api/file',
  config: handlers.create
});

server.route({
  method: ['DELETE'],
  path: '/api/file/{id}',
  config: handlers.remove
});