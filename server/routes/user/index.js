var server = require('server').hapi;
var handlers = require('./handlers');

require('./methods');

server.route({
  method: 'POST',
  path: '/api/user',
  config: handlers.create
});

server.route({
  method: 'PUT',
  path: '/api/user/{id}',
  config: handlers.update
});

server.route({
  method: 'GET',
  path: '/api/user/{id}',
  config: handlers.get
});

server.route({
  method: 'GET',
  path: '/api/user',
  config: handlers.list
});

server.route({
  method: 'DELETE',
  path: '/api/user/{id}',
  config: handlers.remove
});