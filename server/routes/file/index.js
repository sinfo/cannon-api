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
  path: '/files/upload/{kind}',
  config: handlers.upload
});

server.route({
  method: 'POST',
  path: '/files/upload/cv/me',
  config: handlers.uploadCV
});

server.route({
  method: 'GET',
  path: '/files/{id}',
  config: handlers.get
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