const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/company-endpoint',
  config: handlers.create
})

server.route({
  method: ['PUT', 'PATCH'],
  path: '/company-endpoint/{companyId}',
  config: handlers.update
})

server.route({
  method: 'GET',
  path: '/company-endpoint/{companyId}',
  config: handlers.get
})

server.route({
  method: 'GET',
  path: '/company-endpoint',
  config: handlers.list
})

server.route({
  method: 'DELETE',
  path: '/company-endpoint/{companyId}',
  config: handlers.remove
})
