const Joi = require('joi')
const renderAchievement = require('../../views/achievement')
const schemas = require('./schemas')

exports = module.exports

exports.submit = {
  tags: ['api', 'survey'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  validate: {
    params: {
      redeemCode: Joi.string().required().description('redeem code')
    }
  },
  pre: [
    { method: 'redeem.get(params.redeemCode)', assign: 'redeem' },
    { method: 'achievement.get(pre.redeem.achievement)', assign: 'achievement' },
    { method: 'survey.submit(pre.achievement.session, payload)', assign: 'survey' },
    { method: 'achievement.addUser(pre.redeem.achievement, auth.credentials.user.id)', assign: 'achievement' },
    { method: 'user.updatePoints(auth.credentials.user.id, pre.achievement.value)' },
    { method: 'redeem.remove(params.redeemCode)' }
  ],
  handler: function (request, reply) {
    reply(renderAchievement(request.pre.achievement))
  },
  description: 'Submit a survey'
}

exports.getSchema = {
  tags: ['api', 'survey'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    params: {
      id: Joi.string().valid(Object.keys(schemas)).required().description('id of the schema')
    }
  },
  handler: function (request, reply) {
    reply(schemas[request.params.id])
  },
  description: 'Get the structure and fields of the survey'
}

exports.getSessionResponses = {
  tags: ['api', 'survey'],
  auth: false,
  validate: {
    params: {
      sessionId: Joi.string().required().description('id of the session whose surveys we want')
    }
  },
  pre: [
    { method: 'survey.get(params.sessionId)', assign: 'survey' }
  ],
  handler: function (request, reply) {
    reply(request.pre.survey)
  },
  description: 'Get responses of a session'
}

exports.getSessionProcessedResponses = {
  tags: ['api', 'survey'],
  auth: false,
  validate: {
    params: {
      sessionId: Joi.string().required().description('id of the session whose surveys we want')
    }
  },
  pre: [
    { method: 'survey.get(params.sessionId)', assign: 'survey' },
    { method: 'survey.processResponses(pre.survey)', assign: 'result' }
  ],
  handler: function (request, reply) {
    reply(request.pre.result)
  },
  description: 'Get processed responses of a session'
}

exports.checkIn = {
  tags: ['api', 'survey'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('id of the session which is being performed check-in of the attendees')
    },
    payload: {
      users: Joi.array().required().description('An array of users IDs')
    }
  },
  pre: [
    { method: 'session.get(params.sessionId)', assign: 'session' },
    { method: 'user.getMulti(payload.users)', assign: 'users' },
    { method: 'redeem.prepareRedeemCodes(params.sessionId, pre.users)', assign: 'redeemCodes' },
    { method: 'redeem.create(pre.redeemCodes)', assign: 'redeem' },
    { method: 'survey.sendMail(pre.redeemCodes, pre.users, pre.session)', assign: 'mail' }
  ],
  handler: function (request, reply) {
    reply(request.pre.mail)
  },
  description: 'Perform check-in for an array of users, by sending an email with the link to the survey to each user'
}
