var Joi = require('joi');
var log = require('server/helpers/logger');
var render = require('server/views/user');


var handlers = module.exports;

exports.create = {
  tags: ['api','user'],
  auth: {
    strategies: ['default', 'backup'],
  },
  validate: {
    payload: {
      id: Joi.string().description('Id of the user'),
      name: Joi.string().required().description('Name of the user'),
      role: Joi.string().description('Role of the user'),
      mail: Joi.string().email().required().description('Mail of the user'),
      bearer: Joi.array().includes({
        date: Joi.date(),
        token: Joi.string().token()
      }),
      facebook: {
        id: Joi.string(),
        token: Joi.string().token(),
      },
      fenix: {
        id: Joi.string(),
        token: Joi.string().token(),
        refreshToken: Joi.string().token(),
      },
      points: {
        available: Joi.number(),
        total: Joi.number()
      },
      achievements: Joi.array().includes(Joi.object().keys({
        id: Joi.string(),
        date: Joi.date()
      })),
      files: Joi.array().includes(Joi.string()).description('Array of files of the user')
    }
  },
  pre: [
    { method: 'user.create(payload)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user)).created('/api/user/'+request.pre.user.id);
  },
  description: 'Creates a new user'
};


exports.update = {
  tags: ['api','user'],
  auth: {
    strategies: ['default', 'backup'],
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the user we want to update'),
    },
    payload: {
      id: Joi.string().description('Id of the user'),
      name: Joi.string().description('Name of the user'),
      role: Joi.string().description('Role of the user'),
      mail: Joi.string().email().description('Mail of the user'),
      facebook: {
        id: Joi.string(),
        token: Joi.string(),
      },
      fenix: {
        id: Joi.string(),
        token: Joi.string(),
        refreshToken: Joi.string(),
      },
      points: {
        available: Joi.number(),
        total: Joi.number()
      },
      achievements: Joi.array().includes(Joi.object().keys({
        id: Joi.string(),
        date: Joi.date()
      })),
      files: Joi.array().includes(Joi.string()).description('Array of files of the user')
    }
  },
  pre: [
    { method: 'user.update(params.id, payload)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user));
  },
  description: 'Updates an user'
};


exports.get = {
  tags: ['api','user'],
  auth: {
    strategies: ['default', 'backup'],
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the user we want to retrieve'),
    }
  },
  pre: [
    { method: 'user.get(params.id, query)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user));
  },
  description: 'Gets an user'
};


exports.list = {
  tags: ['api','user'],
  auth: {
    strategies: ['default', 'backup'],
  },
  pre: [
    { method: 'user.list(query)', assign: 'users' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.users));
  },
  description: 'Gets all the users'
};


exports.remove = {
  tags: ['api','user'],
  auth: {
    strategies: ['default', 'backup'],
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the user we want to remove'),
    }
  },
  pre: [
    { method: 'user.remove(params.id)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user));
  },
  description: 'Removes an user'
};
