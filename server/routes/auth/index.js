const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: ['POST'],
  path: '/auth/facebook',
  config: handlers.facebook
})

server.route({
  method: ['POST'],
  path: '/auth/google',
  config: handlers.google
})

server.route({
  method: ['POST'],
  path: '/auth/fenix',
  config: handlers.fenix
})

server.route({
  method: ['POST'],
  path: '/auth/add/fenix',
  config: handlers.addFenix
})

server.route({
  method: ['POST'],
  path: '/auth/refresh',
  config: handlers.refreshToken
})
