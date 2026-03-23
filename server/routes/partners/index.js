const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
    method: 'GET',
    path: '/partner',
    options: handlers.getPartners.options,
    handler: handlers.getPartners.handler
})
