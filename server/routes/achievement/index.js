const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/achievements',
  config: handlers.create
})

server.route({
  method: ['PUT', 'PATCH'],
  path: '/achievements/{id}',
  config: handlers.update
})

server.route({
  method: 'GET',
  path: '/achievements/{id}',
  config: handlers.get
})

server.route({
  method: 'GET',
  path: '/achievements/me',
  config: handlers.getMe
})

server.route({
  method: 'DELETE',
  path: '/achievements/me',
  config: handlers.removeMe
})

server.route({
  method: 'GET',
  path: '/achievements/active',
  config: handlers.getActive
})

server.route({
  method: 'GET',
  path: '/achievements/active/me',
  config: handlers.getMeActive
})

server.route({
  method: 'GET',
  path: '/achievements/speed/me',
  config: handlers.getMeSpeed
})

server.route({
  method: 'GET',
  path: '/users/{id}/achievements',
  config: handlers.getUser
})

server.route({
  method: 'GET',
  path: '/achievements',
  config: handlers.list
})

server.route({
  method: 'DELETE',
  path: '/achievements/{id}',
  config: handlers.remove
})

server.route({
  method: 'GET',
  path: '/achievements/code',
  config: handlers.listWithCode
})

server.route({
  method: 'GET',
  path: '/achievements/{id}/code',
  config: handlers.getWithCode
})

server.route({
  method: 'POST',
  path: '/achievements/secret',
  config: handlers.createSecret
})

server.route({
  method: 'POST',
  path: '/achievements/redeem/secret',
  config: handlers.signSecret
})
