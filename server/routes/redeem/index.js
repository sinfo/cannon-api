const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/redeem/{id}',
  config: handlers.redeem
})

server.route({
  method: 'GET',
  path: '/redeem/{id}',
  config: handlers.get
})

server.route({
  method: 'POST',
  path: '/redeem',
  config: handlers.create
})

server.route({
  method: ['DELETE'],
  path: '/redeem/{id}',
  config: handlers.remove
})
