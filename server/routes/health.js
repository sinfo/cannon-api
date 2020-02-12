const server = require('../../').hapi

server.route({
  method: 'GET',
  path: '/health',
  config: {
    tags: ['health'],
    handler: function (request, reply) {
      reply('OK')
    },
    description: 'Health check'
  }
})