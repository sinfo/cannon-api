const Joi = require('joi')
const render = require('../../views/user')

exports = module.exports

exports.create = {
  tags: ['api', 'sign'],
  options:{
    auth: {
      strategies: ['default'],
      scope: ['company']
    },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description('Id of the company we are linking from'),
        attendeeId: Joi.string().required().description('Id of the attendee')
      }),
      payload: Joi.object({
        editionId: Joi.string().required().description('Id of the edition'),
        day: Joi.string().required().description('Day the company is signing the users card')
      })
    },
    pre: [
      { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, payload.editionId)', assign: 'verification' },
      { method: 'achievement.addUserToStandAchievement(params.companyId, params.attendeeId)', assign: 'achievement' },
      { method: 'user.sign(params.attendeeId, params.companyId, payload)', assign: 'user' },
      { method: 'achievement.checkUserStandDay(params.attendeeId)' }
    ],
    description: 'Creates a new signature'
  },
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
}

exports.speed = {
  options:{
    tags: ['api', 'sign'],
    auth: {
      strategies: ['default'],
      scope: ['company']
    },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description('Id of the company '),
        attendeeId: Joi.string().required().description('Id of the attendee')
      }),
      payload: Joi.object({
        editionId: Joi.string().required().description('Id of the edition')
      })
    },
    pre: [
      { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, payload.editionId)', assign: 'verification' },
      { method: 'happyHour.get()', assign: 'happyHours' },
      { method: 'achievement.addUserToSpeedDateAchievement(params.companyId, params.attendeeId, pre.happyHours)', assign: 'achievement' }
    ],
    description: 'Creates a new signature for speed dates'
  },
  handler: function (request, reply) {
    reply(request.pre.achievement)
  },
}

exports.checkIn = {
  options:{
    tags: ['api', 'survey'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin', 'user']
    },
    validate: {
      params: Joi.object({
        sessionId: Joi.string().required().description('id of the session which is being performed check-in of the attendees')
      }),
      payload: Joi.object({
        users: Joi.array().required().description('An array of users IDs'),
        code: Joi.string().description('Validation code for self signing'),
        unregisteredUsers: Joi.number().description('Number of unregistered users')
      })
    },
    pre: [
      { method: 'achievement.addMultiUsersBySession(params.sessionId, payload.users, auth.credentials, payload.code, payload.unregisteredUsers)', assign: 'achievement' }
    ],
    description: 'Perform check-in in a session for an array of users, giving its achievement to each of them'
  },
  handler: function (request, reply) {
    reply(request.pre.achievement)
  },
}

exports.generate = {
  options:{
    tags: ['api', 'survey'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      params: Joi.object({
        sessionId: Joi.string().required().description('id of the session which code is being generated')
      }),
      payload: Joi.object({
        expiration: Joi.date().required().description('Until when the code will be active')
      })
    },
    pre: [
      { method: 'achievement.generateCodeSession(params.sessionId, payload.expiration)', assign: 'achievement' }
    ],
    description: 'Generate a temporary code for user-side check in'
  },
  handler: function (request, reply) {
    reply(request.pre.achievement)
  },
}
