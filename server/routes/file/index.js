var server = require('../../').hapi
var handlers = require('./handlers')

server.route({
  method: 'GET',
  path: '/files',
  config: handlers.list
})

server.route({
  method: 'POST',
  path: '/files',
  config: handlers.create
})

server.route({
  method: 'POST',
  path: '/files/{id}',
  config: handlers.upload
})

server.route({
  method: 'POST',
  path: '/files/me',
  config: handlers.uploadMe
})

server.route({
  method: 'GET',
  path: '/files/{id}',
  config: handlers.get
})

server.route({
  method: 'GET',
  path: '/files/me',
  config: handlers.getMe
})

server.route({
  method: 'GET',
  path: '/files/{id}/download',
  config: handlers.download
})

server.route({
  method: 'GET',
  path: '/files/me/download',
  config: handlers.downloadMe
})

server.route({
  method: ['PUT', 'PATCH'],
  path: '/files/{id}',
  config: handlers.update
})

server.route({
  method: ['DELETE'],
  path: '/files/{id}',
  config: handlers.remove
})

server.route({
  method: ['DELETE'],
  path: '/files/me',
  config: handlers.removeMe
})
