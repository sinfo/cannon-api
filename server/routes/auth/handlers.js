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

exports.google = {
  tags: ['api','auth'],
  auth: {
    strategies: ['default'],
    mode: 'try'
  },
  validate: {
    payload: {
      id: Joi.string().required().description('google id of the member'),
      token: Joi.string().required().description('google token of the member'),
    }
  },
  pre: [
    { method: 'auth.google(payload.id, payload.token)', assign: 'member' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.member));
  },
  description: 'Google login'
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

exports.addFacebook = {
  tags: ['api','auth'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  validate: {
    payload: {
      id: Joi.string().required().description('facebook id of the member'),
      token: Joi.string().required().description('facebook token of the member'),
    }
  },
  pre: [
    { method: 'auth.addFacebook(auth.credentials.user, payload.id, payload.token)', assign: 'member' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.member));
  },
  description: 'Add facebook login'
};

exports.addGoogle = {
  tags: ['api','auth'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  validate: {
    payload: {
      id: Joi.string().required().description('google id of the member'),
      token: Joi.string().required().description('google token of the member'),
    }
  },
  pre: [
    { method: 'auth.addGoogle(auth.credentials.user, payload.id, payload.token)', assign: 'member' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.member));
  },
  description: 'Add google login'
};

exports.refreshToken = {
  tags: ['api','auth'],
  auth: {
    strategies: ['default'],
    mode: 'try'
  },
  validate: {
    payload: {
      id: Joi.string().required().description('fenix code of the member'),
      token: Joi.string().required().description('fenix code of the member'),
      refreshToken: Joi.string().required().description('fenix code of the member'),
    }
  },
  pre: [
    { method: 'auth.refreshToken(payload.id, payload.token, payload.refreshToken)', assign: 'refreshToken' }
  ],
  handler: function (request, reply) {
     reply(render(request.pre.refreshToken));
  },
  description: 'Refresh access token'
};