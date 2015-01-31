var log = require('server/helpers/logger');
var Joi = require('joi');
var handlers = module.exports;

exports.facebook = {
  tags: ['api','auth'],
  auth: {
    strategies: ['default'],
    mode: 'try'
  },
  validate: {
    payload: {
      id: Joi.string().description('facebook id of the member'),
      token: Joi.string().description('facebook token of the member'),
    }
  },
  pre: [
    { method: 'auth.facebook(payload.id, payload.token)', assign: 'member' }
  ],
  handler: function (request, reply) {
    reply(request.pre.member);
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