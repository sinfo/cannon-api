const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/company/{companyId}/sign/{attendeeId}',
  config: handlers.create
})
