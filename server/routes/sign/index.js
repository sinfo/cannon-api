const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/company/{companyId}/sign/{attendeeId}',
  config: handlers.create
})

server.route({
  method: 'POST',
  path: '/sessions/{sessionId}/check-in',
  config: handlers.checkIn
})