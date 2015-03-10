var Joi = require('joi');
var qr = require('qr-image');
var log = require('server/helpers/logger');
var config = require('config');
var renderAchievement = require('server/views/achievement');

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
    { method: 'achievement.get(pre.redeem.achievement)', assign: 'achievement' },
    { method: 'survey.submit(pre.achievement.session, payload)', assign: 'survey' },
    { method: 'achievement.addUser(pre.redeem.achievement, auth.credentials.user.id)', assign: 'achievement' },
    { method: 'user.updatePoints(auth.credentials.user.id, pre.achievement.value)'},
    { method: 'redeem.remove(params.redeemCode)' },
  ],
  handler: function (request, reply) {
    reply({
      success: true,
      achievement: renderAchievement(request.pre.achievement)
    });
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

exports.getSessionResponses = {
  tags: ['api','survey'],
  auth: false,
  validate: {
    params: {
      sessionId: Joi.string().required().description('id of the session whose surveys we want'),
    }
  },
  pre: [
    { method: 'survey.get(params.sessionId)', assign: 'survey' }
  ],
  handler: function (request, reply) {
    reply(request.pre.survey);
  },
  description: 'Get responses of a session'
};

exports.getSessionProcessedResponses = {
  tags: ['api','survey'],
  auth: false,
  validate: {
    params: {
      sessionId: Joi.string().required().description('id of the session whose surveys we want'),
    }
  },
  pre: [
    { method: 'survey.get(params.sessionId)', assign: 'survey' },
    { method: 'survey.processResponses(pre.survey)', assign: 'result' }
  ],
  handler: function (request, reply) {
    reply(request.pre.result);
  },
  description: 'Get processed responses of a session'
};

module.exports = handlers;
