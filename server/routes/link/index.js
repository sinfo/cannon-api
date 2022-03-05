const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/company/{companyId}/link',
  handler: handlers.create.handler,
  options: handlers.create.options
})

server.route({
  method: ['PUT', 'PATCH'],
  path: '/company/{companyId}/link/{attendeeId}',
  options: handlers.update.options,
  handler: handlers.update.handler
})

server.route({
  method: 'GET',
  path: '/company/{companyId}/link',
  options: handlers.list.options,
  handler: handlers.list.handler
})

server.route({
  method: 'GET',
  path: '/company/{companyId}/link/{attendeeId}',
  options: handlers.get.options,
  handler: handlers.get.handler
})

server.route({
  method: 'DELETE',
  path: '/company/{companyId}/link/{attendeeId}',
  options: handlers.remove.options,
  handler: handlers.remove.handler
})
