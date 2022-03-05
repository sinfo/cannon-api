const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'GET',
  path: '/redeem/{id}',
  options: handlers.get.options,
  handler: handlers.get.handler
})

server.route({
  method: 'POST',
  path: '/redeem',
  options: handlers.create.options,
  handler: handlers.create.handler
})

server.route({
  method: ['DELETE'],
  path: '/redeem/{id}',
  options: handlers.remove.options,
  handler: handlers.remove.handler
})
