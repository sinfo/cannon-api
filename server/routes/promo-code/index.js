const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'GET',
  path: '/promo-code',
  config: handlers.find
})
