var Joi = require('joi');
var log = require('server/helpers/logger');
var render = require('server/views/achievement');


var handlers = module.exports;

exports.create = {
  tags: ['api','achievement'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    payload: {
      name: Joi.string().required().description('Name of the achievement'),
      event: Joi.string().required().description('Event the achievement is associated to'),
      category: Joi.string().description('Category of the achievement'),
      description: Joi.string().description('Description of the achievement'),
      instructions: Joi.string().description('Instructions on how to get the achievement'),
      img: Joi.string().description('Image of the achievement'),
      value: Joi.number().description('Amount of points associated to the achievement'),
    }
  },
  pre: [
    { method: 'achievement.create(payload)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievement)).created('/achievement/'+request.pre.achievement.id);
  },
  description: 'Creates a new achievement'
};


exports.update = {
  tags: ['api','achievement'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the achievement we want to update'),
    },
    payload: {
      name: Joi.string().description('Name of the achievement'),
      event: Joi.string().description('Event the achievement is associated to'),
      category: Joi.string().description('Category of the achievement'),
      description: Joi.string().description('Description of the achievement'),
      instructions: Joi.string().description('Instructions on how to get the achievement'),
      img: Joi.string().description('Image of the achievement'),
      value: Joi.number().description('Amount of points associated to the achievement'),
    }
  },
  pre: [
    { method: 'achievement.update(params.id, payload)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievement));
  },
  description: 'Updates an achievement'
};


exports.get = {
  tags: ['api','achievement'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin'],
    mode: 'try'
  },
  validate: {
    query: {
      fields: Joi.string().description('Fields we want to retrieve'),
    },
    params: {
      id: Joi.string().required().description('Id of the achievement we want to retrieve'),
    }
  },
  pre: [
    { method: 'achievement.get(params.id, query)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievement));
  },
  description: 'Gets an achievement'
};


exports.list = {
  tags: ['api','achievement'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin'],
    mode: 'try'
  },
  validate: {
    query: {
      fields: Joi.string().default('id,name,img').description('Fields we want to retrieve'),
    }
  },
  pre: [
    { method: 'achievement.list(query)', assign: 'achievements' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievements));
  },
  description: 'Gets all the achievements'
};


exports.remove = {
  tags: ['api','achievement'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the achievement we want to remove'),
    }
  },
  pre: [
    { method: 'achievement.remove(params.id)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievement));
  },
  description: 'Removes an achievement'
};
