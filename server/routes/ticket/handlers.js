var Joi = require('joi');
var log = require('server/helpers/logger');
var render = require('server/views/ticket');


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
    { method: 'ticket.addUser(params.sessionId, auth.credentials.user.id)', assign: 'ticket' }
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
    { method: 'ticket.removeUser(params.sessionId, auth.credentials.user.id)', assign: 'ticket' }
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
    { method: 'ticket.confirmUser(params.sessionId, auth.credentials.user.id)', assign: 'ticket' }
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
    scope: ['user', 'admin']
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


