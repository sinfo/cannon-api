const server = require('../../').hapi
const handlers = require('./handlers')

// Company link routes
server.route({
  method: 'POST',
  path: '/company/{companyId}/link',
  handler: handlers.createCompanyLink.handler,
  options: handlers.createCompanyLink.options
})

server.route({
  method: ['PUT', 'PATCH'],
  path: '/company/{companyId}/link/{attendeeId}',
  options: handlers.updateCompanyLink.options,
  handler: handlers.updateCompanyLink.handler
})

server.route({
  method: 'GET',
  path: '/company/{companyId}/link',
  options: handlers.listCompanyLinks.options,
  handler: handlers.listCompanyLinks.handler
})

server.route({
  method: 'GET',
  path: '/company/{companyId}/link/{attendeeId}',
  options: handlers.getCompanyLink.options,
  handler: handlers.getCompanyLink.handler
})

server.route({
  method: 'DELETE',
  path: '/company/{companyId}/link/{attendeeId}',
  options: handlers.removeCompanyLink.options,
  handler: handlers.removeCompanyLink.handler
})

// Attendee link routes
server.route({
  method: 'POST',
  path: '/users/{attendeeId}/link',
  handler: handlers.createAttendeeLink.handler,
  options: handlers.createAttendeeLink.options
})

server.route({ //Share user links
  method: 'GET',
  path: '/users/{attendeeId}/shareLinks',
  handler: handlers.shareUserLinks.handler,
  options: handlers.shareUserLinks.options
})

server.route({ //Change link sharing permissions
  method: 'GET',
  path: '/users/shareLinksPermissions',
  handler: handlers.toggleSharePermission.handler,
  options: handlers.toggleSharePermission.options
})

server.route({
  method: ['PUT', 'PATCH'],
  path: '/users/{attendeeId}/link/{companyId}',
  options: handlers.updateAttendeeLink.options,
  handler: handlers.updateAttendeeLink.handler
})

server.route({
  method: 'GET',
  path: '/users/{attendeeId}/link',
  options: handlers.listAttendeeLinks.options,
  handler: handlers.listAttendeeLinks.handler
})

server.route({
  method: 'GET',
  path: '/users/{attendeeId}/link/{companyId}',
  options: handlers.getAttendeeLink.options,
  handler: handlers.getAttendeeLink.handler
})

server.route({
  method: 'DELETE',
  path: '/users/{attendeeId}/link/{companyId}',
  options: handlers.removeAttendeeLink.options,
  handler: handlers.removeAttendeeLink.handler
})