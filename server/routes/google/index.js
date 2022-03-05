const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'GET',
  path: '/google/livestream',
  options: handlers.getLivestream.options,
  handler: handlers.getLivestream.handler
})
