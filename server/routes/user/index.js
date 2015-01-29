var server = require('server').hapi;
var handlers = require('./handlers');

server.route({
  method: 'POST',
  path: '/users',
  config: handlers.create
});

server.route({
  method: 'PUT',
  path: '/users/{id}',
  config: handlers.update
});

server.route({
  method: 'GET',
  path: '/users/me',
  config: handlers.getMe
});

server.route({
  method: 'GET',
  path: '/users/{id}',
  config: handlers.get
});

server.route({
  method: 'GET',
  path: '/users',
  config: handlers.list
});

server.route({
  method: 'DELETE',
  path: '/users/{id}',
  config: handlers.remove
});