const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/tickets/{sessionId}',
  options: handlers.registerTicket.options,
  handler: handlers.registerTicket.handler
})

server.route({
  method: 'DELETE',
  path: '/tickets/{sessionId}',
  options: handlers.voidTicket.options,
  handler: handlers.voidTicket.handler
})

server.route({
  method: 'PUT',
  path: '/tickets/{sessionId}',
  options: handlers.confirmTicket.options,
  handler: handlers.confirmTicket.handler
})

server.route({
  method: 'GET',
  path: '/tickets/{sessionId}',
  options: handlers.get.options,
  handler: handlers.get.handler
})

server.route({
  method: 'GET',
  path: '/tickets',
  options: handlers.list.options,
  handler: handlers.list.handler
})

server.route({
  method: 'PUT',
  path: '/tickets/{sessionId}/{userId}',
  options: handlers.registerPresence.options,
  handler: handlers.registerPresence.handler
})

server.route({
  method: 'GET',
  path: '/tickets/{sessionId}/users',
  options: handlers.getUsers.options,
  handler: handlers.getUsers.handler
})

server.route({
  method: 'GET',
  path: '/tickets/{sessionId}/waiting',
  options: handlers.getWaiting.options,
  handler: handlers.getWaiting.handler
})

server.route({
  method: 'GET',
  path: '/tickets/{sessionId}/confirmed',
  options: handlers.getConfirmed.options,
  handler: handlers.getConfirmed.handler
})

server.route({
  method: 'GET',
  path: '/users/{userId}/sessions',
  options: handlers.getUserSessions.options,
  handler: handlers.getUserSessions.handler
})
