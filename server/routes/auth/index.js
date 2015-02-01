var server = require('server').hapi;
var handlers = require('./handlers');

server.route({
  method: ['POST'],
  path: '/auth/facebook',
  config: handlers.facebook
});

server.route({
  method: ['POST'],
  path: '/auth/fenix',
  config: handlers.fenix
});

server.route({
  method: ['GET'],
  path: '/auth/login/refresh',
  config: handlers.refreshToken
});