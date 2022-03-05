const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: ['POST'],
  path: '/auth/facebook',
  options: handlers.facebook.options,
  handler: handlers.facebook.handler
})

server.route({
  method: ['POST'],
  path: '/auth/google',
  options: handlers.google.options,
  handler: handlers.google.handler
})

server.route({
  method: ['POST'],
  path: '/auth/fenix',
  options: handlers.fenix.options,
  handler: handlers.fenix.handler
})

server.route({
  method: ['POST'],
  path: '/auth/linkedin',
  options: handlers.linkedin.options,
  handler: handlers.linkedin.handler
})
