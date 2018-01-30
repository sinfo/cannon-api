const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/surveys/{redeemCode}',
  config: handlers.submit
})

server.route({
  method: 'GET',
  path: '/surveys/{id}',
  config: handlers.getSchema
})

server.route({
  method: 'GET',
  path: '/sessions/{sessionId}/responses',
  config: handlers.getSessionResponses
})

server.route({
  method: 'GET',
  path: '/sessions/{sessionId}/results',
  config: handlers.getSessionProcessedResponses
})

server.route({
  method: 'POST',
  path: '/sessions/{sessionId}/check-in',
  config: handlers.checkIn
})
