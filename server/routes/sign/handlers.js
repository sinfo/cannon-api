const Joi = require('joi')
const render = require('../../views/user')

exports = module.exports

exports.create = {
  tags: ['api', 'sign'],
  auth: {
    strategies: ['default'],
    scope: ['company']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Id of the company we are linking from'),
      attendeeId: Joi.string().required().description('Id of the attendee')
    },
    payload: {
      editionId: Joi.string().required().description('Id of the edition'),
      day: Joi.string().required().description('Day the company is signing the users card')
    }
  },
  pre: [
    { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, payload.editionId)', assign: 'verification' },
    { method: 'achievement.addUserToStandAchievement(params.companyId, params.attendeeId)', assign: 'achievement' },
    { method: 'user.sign(params.attendeeId, params.companyId, payload)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Creates a new signature'
}

exports.speed = {
  tags: ['api', 'sign'],
  auth: {
    strategies: ['default'],
    scope: ['company']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Id of the company '),
      attendeeId: Joi.string().required().description('Id of the attendee')
    },
    payload: {
      editionId: Joi.string().required().description('Id of the edition')
    }
  },
  pre: [
    { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, payload.editionId)', assign: 'verification' },
    { method: 'happyHour.get()', assign: 'happyHours' },
    { method: 'achievement.addUserToSpeedDateAchievement(params.companyId, params.attendeeId, pre.happyHours)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(request.pre.achievement)
  },
  description: 'Creates a new signature for speed dates'
}

exports.checkIn = {
  tags: ['api', 'survey'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin', 'user']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('id of the session which is being performed check-in of the attendees')
    },
    payload: {
      users: Joi.array().required().description('An array of users IDs'),
      code: Joi.string().description('Validation code for self signing')
    }
  },
  pre: [
    { method: 'achievement.addMultiUsersBySession(params.sessionId, payload.users, auth.credentials, payload.code)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(request.pre.achievement)
  },
  description: 'Perform check-in in a session for an array of users, giving its achievement to each of them'
}

exports.generate = {
  tags: ['api', 'survey'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    params: {
      sessionId: Joi.string().required().description('id of the session which code is being generated')
    },
    payload: {
      expiration: Joi.date().required().description('Until when the code will be active')
    }
  },
  pre: [
    { method: 'achievement.generateCodeSession(params.sessionId, payload.expiration)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(request.pre.achievement)
  },
  description: 'Generate a temporary code for user-side check in'
}
