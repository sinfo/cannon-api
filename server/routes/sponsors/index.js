const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
    method: 'GET',
    path: '/sponsors',
    options: handlers.getSponsors.options,
    handler: handlers.getSponsors.handler
})
