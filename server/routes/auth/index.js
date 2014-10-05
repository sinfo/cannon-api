var server = require('server').hapi;
var handlers = require('./handlers');

//require('./methods');

server.route({
  method: ['GET', 'POST'],
  path: '/login/facebook',
  config: handlers.facebook
});