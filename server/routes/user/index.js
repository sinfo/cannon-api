const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'POST',
  path: '/users',
  config: handlers.create
})

server.route({
  method: 'GET',
  path: '/users',
  config: handlers.find
})

server.route({
  method: ['PATCH', 'PUT'],
  path: '/users/{id}',
  config: handlers.update
})

server.route({
  method: ['PATCH', 'PUT'],
  path: '/users/me',
  config: handlers.updateMe
})

server.route({
  method: 'POST',
  path: '/users/{id}/redeem-card',
  config: handlers.redeemCard
})

server.route({
  method: 'GET',
  path: '/users/{id}',
  config: handlers.get
})

server.route({
  method: 'GET',
  path: '/users/me',
  config: handlers.getMe
})

server.route({
  method: 'POST',
  path: '/users/users',
  config: handlers.getMulti
})

server.route({
  method: 'DELETE',
  path: '/users/{id}/company',
  config: handlers.removeCompany
})

server.route({
  method: 'DELETE',
  path: '/users/{id}',
  config: handlers.remove
})

server.route({
  method: 'DELETE',
  path: '/users/me',
  config: handlers.removeMe
})
