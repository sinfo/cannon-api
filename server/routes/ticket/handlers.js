const Joi = require('joi')
const render = require('../../views/ticket')
const renderUsers = require('../../views/user')

exports = module.exports

exports.registerTicket = {
  tags: ['api', 'ticket'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session')
    }
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'session.ticketsNeeded(pre.session)' },
    { method: 'session.inRegistrationPeriod(pre.session)' },
    { method: 'ticket.userRegistered(params.sessionId, auth.credentials.user.id)' },
    { method: 'ticket.addUser(params.sessionId, auth.credentials.user.id, pre.session)', assign: 'ticket' },
    { method: 'ticket.registrationEmail(pre.ticket, pre.session, auth.credentials.user)', failAction: 'log' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.ticket, request.pre.session))
  },
  description: 'Registers a ticket for the current user.'
}

exports.voidTicket = {
  tags: ['api', 'ticket'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session')
    }
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'session.ticketsNeeded(pre.session)' },
    { method: 'ticket.get(params.sessionId)', assign: 'ticket' },
    { method: 'ticket.removeUser(pre.session.id, auth.credentials.user.id, pre.session)', assign: 'removedTicket' },
    { method: 'ticket.getAcceptedUser(pre.ticket, pre.session, auth.credentials.user)', assign: 'user', failAction: 'ignore' },
    { method: 'ticket.registrationAcceptedEmail(pre.ticket, pre.session, pre.user)', failAction: 'ignore' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.removedTicket, request.pre.session))
  },
  description: 'Voids a ticket for the current user.'
}

exports.confirmTicket = {
  tags: ['api', 'ticket'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session')
    }
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'session.ticketsNeeded(pre.session)' },
    { method: 'session.inConfirmationPeriod(pre.session)' },
    { method: 'ticket.userConfirmed(params.sessionId, auth.credentials.user.id)' },
    { method: 'ticket.confirmUser(params.sessionId, auth.credentials.user.id, pre.session)', assign: 'ticket' },
    { method: 'ticket.confirmationEmail(pre.ticket, pre.session, auth.credentials.user)', failAction: 'log' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.ticket, request.pre.session))
  },
  description: 'Lets a user confirm that he is going on the day of the session.'
}

exports.get = {
  tags: ['api', 'ticket'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session')
    }
  },
  pre: [
    [
      { method: 'session.get(params.sessionId)', assign: 'session' },
      { method: 'ticket.get(params.sessionId)', assign: 'ticket' }
    ]
  ],
  handler: function (request, reply) {
    reply(render(request.pre.ticket, request.pre.session))
  },
  description: 'Gets a ticket'
}

exports.list = {
  tags: ['api', 'ticket'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  validate: {
    query: {
      fields: Joi.string().description('Fields we want to retrieve'),
      sort: Joi.string().description('Sort fields we want to retrieve'),
      skip: Joi.number().description('Number of documents we want to skip'),
      limit: Joi.number().description('Limit of documents we want to retrieve')
    }
  },
  pre: [
    { method: 'ticket.list(query)', assign: 'tickets' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.tickets))
  },
  description: 'Gets all the tickets'
}

exports.registerPresence = {
  tags: ['api', 'ticket'],
  auth: {
    strategies: ['default'],
    scope: ['admin']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session'),
      userId: Joi.string().required().description('Id of the user')
    }
  },
  pre: [
    [
      { method: 'session.get(params.sessionId)', assign: 'session' },
      { method: 'ticket.registerUserPresence(params.sessionId, params.userId)', assign: 'ticket' }
    ]
  ],
  handler: function (request, reply) {
    reply(render(request.pre.ticket, request.pre.session))
  },
  description: 'Lets an admin confirm that the user showed up on the session.'
}

exports.getUsers = {
  tags: ['api', 'ticket'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session')
    }
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'ticket.getRegisteredUsers(params.sessionId, pre.session)', assign: 'userIds' },
    { method: 'user.getMulti(pre.userIds)', assign: 'users' }
  ],
  handler: function (request, reply) {
    console.log(request.pre.userIds)

    reply(renderUsers(request.pre.users, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Gets the users'
}

exports.getWaiting = {
  tags: ['api', 'ticket'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session')
    }
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'ticket.getWaitingUsers(params.sessionId, pre.session)', assign: 'userIds' },
    { method: 'user.getMulti(pre.userIds)', assign: 'users' }
  ],
  handler: function (request, reply) {
    console.log(request.pre.userIds)

    reply(renderUsers(request.pre.users, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Gets the waiting users'
}

exports.getConfirmed = {
  tags: ['api', 'ticket'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session')
    }
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'ticket.getConfirmedUsers(params.sessionId, pre.session)', assign: 'userIds' },
    { method: 'user.getMulti(pre.userIds)', assign: 'users' }
  ],
  handler: function (request, reply) {
    console.log(request.pre.userIds)

    reply(renderUsers(request.pre.users, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Gets the confirmed users'
}

exports.getUserSessions = {
  tags: ['api', 'ticket'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    params: {
      userId: Joi.string().required().description('Id of the user')
    }
  },
  pre: [
    { method: 'ticket.getUserSessions(params.userId)', assign: 'tickets' }
  ],
  handler: function (request, reply) {
    console.log(request.pre.tickets)
    reply(request.pre.tickets)
  },
  description: 'Gets the sessions for a user'
}
