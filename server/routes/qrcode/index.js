const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'GET',
  path: '/qrcode/{id}',
  config: handlers.generate
})

server.route({
  method: 'GET',
  path: '/r/{id}',
  config: handlers.redirect
})
