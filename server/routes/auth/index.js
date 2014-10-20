var server = require('server').hapi;
var handlers = require('./handlers');

server.route({
  method: ['GET', 'POST'],
  path: '/login/facebook',
  config: handlers.facebook
});

server.route({
  method: ['GET'],
  path: '/login/refresh',
  config: handlers.refreshToken
});