var log = require('server/helpers/logger');
var Joi = require('joi');
var handlers = module.exports;

exports.facebook = {
  tags: ['api','auth'],
  auth: {
    strategies: ['default', 'facebook'],
  },
  pre: [
    { method: 'auth.facebook(auth)', assign: 'facebook' }
  ],
  handler: function (request, reply) {
     reply(request.pre.facebook);
  },
  description: 'Facebook login'
};

exports.refreshToken = {
  tags: ['api','auth'],
  validate: {
    params: {
      id: Joi.string().required().description('Id of the user we want to retrieve'),
    }
  },
  auth: {
    strategies: ['default'],
    mode: 'required'
  },
  pre: [
    { method: 'auth.refreshToken(auth)', assign: 'refreshToken' }
  ],
  handler: function (request, reply) {
     reply(request.pre.refreshToken);
  },
  description: 'Facebook login'
};