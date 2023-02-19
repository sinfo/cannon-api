const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/company-endpoint',
  options: handlers.create.options,
  handler: handlers.create.handler
})

server.route({
  method: ['PUT', 'PATCH'],
  path: '/company-endpoint/{companyId}',
  options: handlers.update.options,
  handler: handlers.update.handler
})

server.route({
  method: 'GET',
  path: '/company-endpoint/{companyId}',
  options: handlers.get.options,
  handler: handlers.get.handler
})

server.route({
  method: 'GET',
  path: '/company-endpoint',
  options: handlers.list.options,
  handler: handlers.list.handler
})

server.route({
  method: 'DELETE',
  path: '/company-endpoint/{companyId}',
  options: handlers.remove.options,
  handler: handlers.remove.handler
})
