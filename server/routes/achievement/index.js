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
