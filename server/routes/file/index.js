const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
  method: 'GET',
  path: '/files',
  options: handlers.list.options,
  handler: handlers.list.handler
})

server.route({
  method: 'POST',
  path: '/files',
  options: handlers.create.options,
  handler: handlers.create.handler
})

server.route({
  method: 'POST',
  path: '/files/{id}',
  options: handlers.upload.options,
  handler: handlers.upload.handler
})

server.route({
  method: 'POST',
  path: '/files/me',
  options: handlers.uploadMe.options,
  handler: handlers.uploadMe.handler
})

server.route({
  method: 'GET',
  path: '/files/{id}',
  options: handlers.get.options,
  handler: handlers.get.handler
})

server.route({
  method: 'GET',
  path: '/files/me',
  options: handlers.getMe.options,
  handler: handlers.getMe.handler
})

server.route({
  method: 'GET',
  path: '/files/users/{id}',
  options: handlers.getUserFile.options,
  handler: handlers.getUserFile.handler
})

server.route({
  method: 'GET',
  path: '/files/{id}/download',
  options: handlers.download.options,
  handler: handlers.download.handler
})

server.route({
  method: 'GET',
  path: '/files/me/download',
  options: handlers.downloadMe.options,
  handler: handlers.downloadMe.handler
})

server.route({
  method: 'GET',
  path: '/files/download',
  options: handlers.downloadZip.options,
  handler: handlers.downloadZip.handler
})

server.route({
  method: ['PUT', 'PATCH'],
  path: '/files/{id}',
  options: handlers.update.options,
  handler: handlers.update.handler
})

server.route({
  method: ['DELETE'],
  path: '/files/{id}',
  options: handlers.remove.options,
  handler: handlers.remove.handler
})

server.route({
  method: ['DELETE'],
  path: '/files/me',
  options: handlers.removeMe.options,
  handler: handlers.removeMe.handler
})

server.route({
  method: 'GET',
  path: '/company/{companyId}/files/download',
  options: handlers.downloadCompany.options,
  handler: handlers.downloadCompany.handler
})
