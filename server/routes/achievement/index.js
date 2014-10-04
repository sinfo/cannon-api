var server = require('server').hapi;
var handlers = require('./handlers');

require('./methods');

server.route({
  method: 'POST',
  path: '/api/achievement',
  config: handlers.create
});

server.route({
  method: 'PUT',
  path: '/api/achievement/{id}',
  config: handlers.update
});

server.route({
  method: 'GET',
  path: '/api/achievement/{id}',
  config: handlers.get
});

server.route({
  method: 'GET',
  path: '/api/achievement',
  config: handlers.list
});

server.route({
  method: 'DELETE',
  path: '/api/achievement/{id}',
  config: handlers.remove
});