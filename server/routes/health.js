const server = require('../../').hapi

server.route({
  method: 'GET',
  path: '/health',
  config: {
    tags: ['health'],
    handler: function (request, h) {
      return 'OK'
    },
    description: 'Health check'
  }
})
