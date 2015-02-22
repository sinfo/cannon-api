var Joi = require('joi');
var qr = require('qr-image');
var log = require('server/helpers/logger');
var config = require('config');

var handlers = module.exports;

var schemas = require('./schemas');

exports.submit = {
  tags: ['api','survey'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  validate: {
    params: {
      redeemCode: Joi.string().required().description('redeem code'),
    }
  },
  pre: [
    { method: 'redeem.get(params.redeemCode)', assign: 'redeem' },
    { method: 'achievement.get(pre.redeemCode.achievement)', assign: 'achievement' },
    { method: 'survey.submit(pre.achievement.session, payload)', assign: 'survey' },
    { method: 'achievement.addUser(pre.redeemCode.achievement, auth.credentials.user.id)', assign: 'achievement' },
    { method: 'redeem.remove(params.redeemCode)' },
  ],
  handler: function (request, reply) {
    reply({success: true});
  },
  description: 'Submit a survey'
};

exports.getSchema = {
  tags: ['api','survey'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin'],
    mode: 'try'
  },
  validate: {
    params: {
      id: Joi.string().valid(Object.keys(schemas)).required().description('id of the schema'),
    }
  },
  handler: function (request, reply) {
    reply(schemas[request.params.id]);
  },
  description: 'Submit a survey'
};

module.exports = handlers;
