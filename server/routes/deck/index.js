const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
    method: 'GET',
    path: '/company',
    options: handlers.getAll.options,
    handler: handlers.getAll.handler
})

server.route({
    method: 'GET',
    path: '/company/{companyId}',
    options: handlers.getCompany.options,
    handler: handlers.getCompany.handler
})

server.route({
    method: 'GET',
    path: '/member',
    options: handlers.getMembers.options,
    handler: handlers.getMembers.handler
})

server.route({
    method: 'GET',
    path: '/event',
    options: handlers.getEvents.options,
    handler: handlers.getEvents.handler
})

server.route({
    method: 'GET',
    path: '/event/latest',
    options: handlers.getLatestEvent.options,
    handler: handlers.getLatestEvent.handler
})

server.route({
    method: 'GET',
    path: '/session',
    options: handlers.getSessions.options,
    handler: handlers.getSessions.handler
})

server.route({
    method: 'GET',
    path: '/session/{sessionId}',
    options: handlers.getSession.options,
    handler: handlers.getSession.handler
})

server.route({
    method: 'GET',
    path: '/speaker',
    options: handlers.getSpeakers.options,
    handler: handlers.getSpeakers.handler
})

server.route({
    method: 'GET',
    path: '/speaker/{speakerId}',
    options: handlers.getSpeaker.options,
    handler: handlers.getSpeaker.handler
})

server.route({
    method: 'GET',
    path: '/calendar',
    options: handlers.getCalendarUrl.options,
    handler: handlers.getCalendarUrl.handler
})