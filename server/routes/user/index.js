const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/users',
  options: handlers.create.options,
  handler: handlers.create.handler
})

server.route({
  method: 'GET',
  path: '/users',
  options: handlers.find.options,
  handler: handlers.find.handler
})

server.route({
  method: ['PATCH', 'PUT'],
  path: '/users/{id}',
  options: handlers.update.options,
  handler: handlers.update.handler
})

server.route({
  method: ['PATCH', 'PUT'],
  path: '/users/me',
  options: handlers.updateMe.options,
  handler: handlers.updateMe.handler
})

server.route({
  method: 'POST',
  path: '/users/{id}/redeem-card',
  options: handlers.redeemCard.options,
  handler: handlers.redeemCard.handler
})

server.route({
  method: 'GET',
  path: '/users/{id}',
  options: handlers.get.options,
  handler: handlers.get.handler
})

server.route({
  method: 'GET',
  path: '/users/me',
  options: handlers.getMe.options,
  handler: handlers.getMe.handler
})

server.route({
  method: 'POST',
  path: '/users/users',
  options: handlers.getMulti.options,
  handler: handlers.getMulti.handler
})

server.route({
  method: 'DELETE',
  path: '/users/{id}/company',
  options: handlers.removeCompany.options,
  handler: handlers.removeCompany.handler
})

server.route({
  method: 'DELETE',
  path: '/users/{id}',
  options: handlers.remove.options,
  handler: handlers.remove.handler
})

server.route({
  method: 'DELETE',
  path: '/users/me',
  options: handlers.removeMe.options,
  handler: handlers.removeMe.handler
})
