var log = require('server/helpers/logger');
var Joi = require('joi');
var handlers = module.exports;

exports.facebook = {
  auth: {
    strategies: ['default', 'facebook'],
    mode: 'optional'
  },
  pre: [
    { method: 'auth.facebook(auth)', assign: 'facebook' }
  ],
  handler: function (request, reply) {
     reply(request.pre.facebook).redirect('/');
  },
  description: 'Facebook login'
};

exports.refreshToken = {
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