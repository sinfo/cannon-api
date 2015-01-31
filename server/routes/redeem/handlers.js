var Joi = require('joi');
var log = require('server/helpers/logger');
var render = require('server/views/redeem');


var handlers = module.exports;

exports.create = {
  tags: ['api','user'],
  auth: {
    strategies: ['default', 'backup'],
  },
  validate: {
    payload: {
    	id: Joi.string().required().description('Redeem Code id.'),
		achievement: Joi.string().required().description('Achievement you want to redeem.'),
		entries: Joi.number().required().description('Number of entries this code can be applied to.'),
		created: Joi.date().required().description('Date of redeem code creation.'),
		expires: Joi.date().required().description('Date of redeem code expiration.'),
	}
  },
  pre: [
    { method: 'redeem.create(payload)', assign: 'redeem' }
  ],
  handler: function (request, reply) {
    reply(render(request.redeem)).created('/api/redeem/'+request.pre.redeem.id);
  },
  description: 'Creates a new Redeem Code.'
};


exports.update = {
  tags: ['api','user'],
  auth: {
    strategies: ['default', 'backup'],
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the redeem code we want to update'),
    },
    payload: {
    	id: Joi.string().required().description('Redeem Code id.'),
		achievement: Joi.string().required().description('Achievement you want to redeem.'),
		entries: Joi.number().required().description('Number of entries this code can be applied to.'),
		created: Joi.date().required().description('Date of redeem code creation.'),
		expires: Joi.date().required().description('Date of redeem code expiration.'),
    }
  },
  pre: [
    { method: 'redeem.update(params.id, payload)', assign: 'redeem' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.redeem));
  },
  description: 'Updates a redeem code'
};


exports.get = {
  tags: ['api','redeem'],
  auth: {
    strategies: ['default', 'backup'],
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the redeem code we want to retrieve'),
    }
  },
  pre: [
    { method: 'redeem.get(params.id, query)', assign: 'redeem' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.redeem));
  },
  description: 'Gets a redeem code'
};


exports.list = {
  tags: ['api','user'],
  auth: {
    strategies: ['default', 'backup'],
  },
  pre: [
    { method: 'redeem.list(query)', assign: 'reddems' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.redeems));
  },
  description: 'Gets all the redeem codes'
};


exports.remove = {
  tags: ['api','user'],
  auth: {
    strategies: ['default', 'backup'],
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the redeem code we want to remove'),
    }
  },
  pre: [
    { method: 'redeem.remove(params.id)', assign: 'redeem' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.redeem));
  },
  description: 'Removes a redeem code'
};