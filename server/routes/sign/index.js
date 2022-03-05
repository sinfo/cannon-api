const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/company/{companyId}/sign/{attendeeId}',
  options: handlers.create.options,
  handler: handlers.create.handler
})

server.route({
  method: 'POST',
  path: '/company/{companyId}/speed/{attendeeId}',
  options: handlers.speed.options,
  handler: handlers.speed.handler
})

server.route({
  method: 'POST',
  path: '/sessions/{sessionId}/check-in',
  options: handlers.checkIn.options,
  handler: handlers.checkIn.handler
})

server.route({
  method: 'POST',
  path: '/sessions/{sessionId}/generate',
  options: handlers.generate.options,
  handler: handlers.generate.handler
})
