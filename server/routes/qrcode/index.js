const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'GET',
  path: '/qrcode/{id}',
  options: handlers.generate.options,
  handler: handlers.generate.handler
})

server.route({
  method: 'GET',
  path: '/r/{id}',
  options: handlers.redirect.options,
  handler: handlers.redirect.handler
})
