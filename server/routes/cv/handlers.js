var Joi = require('joi');
var log = require('server/helpers/logger');
var render = require('server/views/cv');


var handlers = module.exports;

exports.create = {
  tags: ['api','cv'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    payload: {
    	id: Joi.string().description('CV id.'),
      user: Joi.string().description('User id'),
      file: Joi.string().description('CV file associated with the model'),
      area: Joi.string().description('Working area'),
      startup: Joi.boolean().description('Would like to work in a startup'),
      internship: Joi.boolean().description('Interested in internships'),
      available: Joi.date().description('Availability to work'),
      expires: Joi.date().description('Expiration date')
    }
  },
  pre: [
    { method: 'cv.create(payload)', assign: 'cv' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.cv)).created('/cv/'+request.pre.cv.id);
  },
  description: 'Creates a new CV',
};

exports.createMe = {
  tags: ['api','cv'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  validate: {
    payload: {
      file: Joi.string().required().description('CV file associated with the model'),
      area: Joi.string().required().description('Working area'),
      startup: Joi.boolean().required().description('Would like to work in a startup'),
      internship: Joi.boolean().required().description('Interested in internships'),
      available: Joi.date().required().description('Availability to work'),
    }
  },
  pre: [
    { method: 'cv.create(payload, auth.credentials.user.id)', assign: 'cv' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.cv)).created('/cv/'+request.pre.cv.id);
  },
  description: 'Creates a new CV',
};


exports.update = {
  tags: ['api','cv'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    query: {
      upsert: Joi.string().default('true').description('If none, creat it')
    },
    params: {
      id: Joi.string().required().description('Id of the cv code we want to update'),
    },
    payload: {
    	id: Joi.string().description('CV id.'),
      file: Joi.string().description('CV file associated with the model'),
      area: Joi.string().description('Working area'),
      startup: Joi.boolean().description('Would like to work in a startup'),
      internship: Joi.boolean().description('Interested in internships'),
      available: Joi.date().description('Availability to work'),
    }
  },
  pre: [
    { method: 'cv.update(params.id, query, payload)', assign: 'cv' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.cv));
  },
  description: 'Updates a cv - admin only'
};

exports.updateMe = {
  tags: ['api','cv'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  validate: {
    query: {
      upsert: Joi.string().default('true').description('If none, creat it')
    },
    payload: {
      id: Joi.string().description('CV id.'),
      area: Joi.string().description('Working area'),
      startup: Joi.boolean().description('Would like to work in a startup'),
      internship: Joi.boolean().description('Interested in internships'),
      available: Joi.date().description('Availability to work'),
    }
  },
  pre: [
    { method: 'cv.update(auth.credentials.user.id, payload)', assign: 'cv' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.cv));
  },
  description: 'Updates a cv'
};


exports.get = {
  tags: ['api','cv'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the cv code we want to retrieve'),
    }
  },
  pre: [
    { method: 'cv.get(params.id, query)', assign: 'cv' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.cv));
  },
  description: 'Gets a cv - admin only'
};

exports.getMe = {
  tags: ['api','cv'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  pre: [
    { method: 'cv.get(auth.credentials.user.cv, query)', assign: 'cv' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.cv));
  },
  description: 'Gets a cv'
};


exports.list = {
  tags: ['api','cv'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  pre: [
    { method: 'cv.list(query)', assign: 'cvs' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.cvs));
  },
  description: 'Gets all the cvs - admin only'
};


exports.remove = {
  tags: ['api','cv'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the cv we want to remove'),
    }
  },
  pre: [
    { method: 'cv.remove(params.id)', assign: 'cv' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.cv));
  },
  description: 'Removes a cv - admin only'
};

exports.removeMe = {
  tags: ['api','cv'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  pre: [
    { method: 'cv.remove(auth.credentials.user.cv)', assign: 'cv' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.cv));
  },
  description: 'Removes a cv'
};