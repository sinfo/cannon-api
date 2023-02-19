const server = require('../../').hapi
const handlers = require('./handlers')
const log = require('../../helpers/logger')

server.route({
  method: 'POST',
  path: '/achievements',
  options: handlers.create.options,
  handler: handlers.create.handler
})

server.route({
  method: ['PUT', 'PATCH'],
  path: '/achievements/{id}',
  options: handlers.update.options,
  handler: handlers.update.handler
})

server.route({
  method: 'GET',
  path: '/achievements/{id}',
  options: handlers.get.options,
  handler: handlers.get.handler
})

server.route({
  method: 'GET',
  path: '/achievements/me',
  options: handlers.getMe.options,
  handler: handlers.getMe.handler
})

server.route({
  method: 'DELETE',
  path: '/achievements/me',
  options: handlers.removeMe.options,
  handler: handlers.removeMe.handler
})

server.route({
  method: 'GET',
  path: '/achievements/active',
  options: handlers.getActive.options,
  handler: handlers.getActive.handler
})

server.route({
  method: 'GET',
  path: '/achievements/active/me',
  options: handlers.getActive.options,
  handler: handlers.getMeActive.handler
})

server.route({
  method: 'GET',
  path: '/achievements/speed/me',
  options: handlers.getMeSpeed.options,
  handler: handlers.getMeSpeed.handler
})

server.route({
  method: 'GET',
  path: '/users/{id}/achievements',
  options: handlers.getUser.options,
  handler: handlers.getUser.handler
})

server.route({
  method: 'GET',
  path: '/achievements',
  options: handlers.list.options,
  handler: handlers.list.handler
})

server.route({
  method: 'DELETE',
  path: '/achievements/{id}',
  options: handlers.remove.options,
  handler: handlers.remove.handler
})

server.route({
  method: 'GET',
  path: '/achievements/code',
  options: handlers.listWithCode.options,
  handler: handlers.listWithCode.handler
})

server.route({
  method: 'GET',
  path: '/achievements/{id}/code',
  options: handlers.getWithCode.options,
  handler: handlers.getWithCode.handler
})

server.route({
  method: 'POST',
  path: '/achievements/secret',
  options: handlers.createSecret.options,
  handler: handlers.createSecret.handler
})

server.route({
  method: 'POST',
  path: '/achievements/redeem/secret',
  options: handlers.signSecret.options,
  handler: handlers.signSecret.handler
})

server.route({
  method: 'GET',
  path: '/achievements/session/{id}',
  options: handlers.getAchievementBySession.options,
  handler: handlers.getAchievementBySession.handler
})
