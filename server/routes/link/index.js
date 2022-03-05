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
  config: handlers.update
})

server.route({
  method: 'GET',
  path: '/company/{companyId}/link',
  config: handlers.list
})

server.route({
  method: 'GET',
  path: '/company/{companyId}/link/{attendeeId}',
  config: handlers.get
})

server.route({
  method: 'DELETE',
  path: '/company/{companyId}/link/{attendeeId}',
  options: handlers.remove.options,
  handler: handlers.remove.handler
})
