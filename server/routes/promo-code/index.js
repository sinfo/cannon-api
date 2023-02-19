const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'GET',
  path: '/promo-code',
  options: handlers.find.options,
  handler: handlers.find.handler
})
