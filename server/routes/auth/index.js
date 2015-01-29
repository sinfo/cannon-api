var server = require('server').hapi;
var handlers = require('./handlers');

server.route({
  method: ['GET', 'POST'],
  path: '/auth/facebook/{id}/{token}',
  config: handlers.facebook
});

server.route({
  method: ['GET'],
  path: '/auth/login/refresh',
  config: handlers.refreshToken
});