var log = require('server/helpers/logger');
var Joi = require('joi');
var render = require('server/views/auth');
var handlers = module.exports;

exports.facebook = {
  tags: ['api','auth'],
  auth: {
    strategies: ['default'],
    mode: 'try'
  },
  validate: {
    payload: {
      id: Joi.string().required().description('facebook id of the member'),
      token: Joi.string().required().description('facebook token of the member'),
    }
  },
  pre: [
    { method: 'auth.facebook(payload.id, payload.token)', assign: 'member' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.member));
  },
  description: 'Facebook login'
};

exports.fenix = {
  tags: ['api','auth'],
  auth: {
    strategies: ['default'],
    mode: 'try'
  },
  validate: {
    payload: {
      code: Joi.string().required().description('fenix code of the member')
    }
  },
  pre: [
    { method: 'auth.fenix(payload.code)', assign: 'member' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.member));
  },
  description: 'Fenix login'
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
     reply(render(request.pre.refreshToken));
  },
  description: 'Facebook login'
};