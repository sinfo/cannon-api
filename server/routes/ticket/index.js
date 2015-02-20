var server     = require('server').hapi;
var handlers   = require('./handlers');

server.route({
  method: 'POST',
  path: '/tickets/{sessionId}',
  config: handlers.registerTicket
});

server.route({
  method: 'DELETE',
  path: '/tickets/{sessionId}',
  config: handlers.voidTicket
});

server.route({
  method: 'PUT',
  path: '/tickets/{sessionId}',
  config: handlers.confirmTicket
});

server.route({
  method: 'GET',
  path: '/tickets/{sessionId}',
  config: handlers.get
});

server.route({
  method: 'GET',
  path: '/tickets',
  config: handlers.list
});

server.route({
  method: 'PUT',
  path: '/tickets/{sessionId}/{userId}',
  config: handlers.registerPresence
});

server.route({
  method: 'GET',
  path: '/tickets/{sessionId}/users',
  config: handlers.getUsers
});

server.route({
  method: 'GET',
  path: '/tickets/{sessionId}/wating',
  config: handlers.getWaiting
});

server.route({
  method: 'GET',
  path: '/tickets/{sessionId}/confirmed',
  config: handlers.getConfirmed
});
