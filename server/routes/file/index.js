var server = require('server').hapi;
var handlers = require('./handlers');

server.route({
  method: 'GET',
  path: '/files',
  config: handlers.list
});

server.route({
  method: 'POST',
  path: '/files',
  config: handlers.create
});

server.route({
  method: 'POST',
  path: '/files/{id}',
  config: handlers.upload
});

server.route({
  method: 'POST',
  path: '/files/me',
  config: handlers.uploadMe
});

server.route({
  method: 'GET',
  path: '/files/{id}',
  config: handlers.get
});

server.route({
  method: 'GET',
  path: '/files/me',
  config: handlers.getMe
});

server.route({
  method: ['PUT','PATCH'],
  path: '/files/{id}',
  config: handlers.update
});

server.route({
  method: ['DELETE'],
  path: '/files/{id}',
  config: handlers.remove
});

server.route({
  method: ['DELETE'],
  path: '/files/me',
  config: handlers.removeMe
});