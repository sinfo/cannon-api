var Joi = require('joi');
var log = require('server/helpers/logger');
var render = require('server/views/ticket');
var renderUsers = require('server/views/user');


var handlers = module.exports;

exports.registerTicket = {
  tags: ['api','ticket'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session'),
    },
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'session.ticketsNeeded(pre.session)' },
    { method: 'session.inRegistrationPeriod(pre.session)' },
    { method: 'ticket.addUser(params.sessionId, auth.credentials.user.id, pre.session)', assign: 'ticket' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.ticket));
  },
  description: 'Registers a ticket for the current user.',
};


exports.voidTicket = {
  tags: ['api','ticket'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session'),
    },
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'session.ticketsNeeded(pre.session)' },
    { method: 'ticket.removeUser(params.sessionId, auth.credentials.user.id, pre.session)', assign: 'ticket' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.ticket));
  },
  description: 'Voids a ticket for the current user.',
};


exports.confirmTicket = {
  tags: ['api','ticket'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session'),
    },
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'session.ticketsNeeded(pre.session)' },
    { method: 'session.inConfirmationPeriod(pre.session)' },
    { method: 'ticket.confirmUser(params.sessionId, auth.credentials.user.id, pre.session)', assign: 'ticket' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.ticket));
  },
  description: 'Lets a user confirm that he is going on the day of the session.',
};


exports.get = {
  tags: ['api','ticket'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin'],
    mode: 'try'
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session'),
    }
  },
  pre: [
    { method: 'ticket.get(params.sessionId)', assign: 'ticket' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.ticket));
  },
  description: 'Gets a ticket'
};


exports.list = {
  tags: ['api','ticket'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user','admin']
  },
  pre: [
    { method: 'ticket.list(query)', assign: 'tickets' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.tickets));
  },
  description: 'Gets all the tickets'
};


exports.registerPresence = {
  tags: ['api','ticket'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session'),
      userId: Joi.string().required().description('Id of the user'),
    },
  },
  pre: [
    { method: 'ticket.registerUserPresence(params.sessionId, params.userId)', assign: 'ticket' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.ticket));
  },
  description: 'Lets an admin confirm that the user showed up on the session.',
};


exports.getUsers = {
  tags: ['api','ticket'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin'],
    mode: 'try'
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('Id of the session'),
    }
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'ticket.getRegisteredUsers(params.sessionId, pre.session)', assign: 'userIds' },
    { method: 'user.getMulti(pre.userIds)', assign: 'users' }
  ],
  handler: function (request, reply) {
    console.log(request.pre.userIds);

    reply(renderUsers(request.pre.users, request.auth.credentials && request.auth.credentials.user));
  },
  description: 'Gets a ticket'
};


