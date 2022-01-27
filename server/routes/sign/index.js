const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/company/{companyId}/sign/{attendeeId}',
  config: handlers.create
})

server.route({
  method: 'POST',
  path: '/company/{companyId}/speed/{attendeeId}',
  config: handlers.speed
})

server.route({
  method: 'POST',
  path: '/sessions/{sessionId}/check-in',
  config: handlers.checkIn
})

server.route({
  method: 'POST',
  path: '/sessions/{sessionId}/generate',
  config: handlers.generate
})
