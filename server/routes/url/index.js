const server = require('../../').hapi
const handlers = require('./handlers')

// server.route({
//   method: 'POST',
//   path: '/url',
//   options: handlers.create.options,
//   handler: handlers.create.handler
// })
//
// server.route({
//   method: ['PUT', 'PATCH'],
//   path: '/url/{id}',
//   options: handlers.update.options,
//   handler: handlers.update.handler
// })
//
// server.route({
//   method: 'GET',
//   path: '/url/{id}',
//   options: handlers.get.options,
//   handler: handlers.get.handler
// })

server.route({
  method: 'GET',
  path: '/company/{companyId}/url',
  options: handlers.get.options,
  handler: handlers.get.handler
})

// server.route({
//   method: 'GET',
//   path: '/url',
//   options: handlers.list.options,
//   handler: handlers.list.handler
// })
//
// server.route({
//   method: 'DELETE',
//   path: '/company-endpoint/{companyId}',
//   options: handlers.remove.options,
//   handler: handlers.remove.handler
// })
//
