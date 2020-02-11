const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
    method: 'GET',
    path: '/google/livestream',
    config: handlers.getLivestream
});