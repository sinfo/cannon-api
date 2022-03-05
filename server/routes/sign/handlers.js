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
    description: 'Creates a new signature'
  },
  handler: async function (request, h) {
    try {
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.payload.editionId)
      await request.server.methods.achievement.addUserToStandAchievement(request.params.companyId, request.params.attendeeId)
      let user = await request.server.methods.user.sign(request.params.attendeeId, request.params.companyId, request.payload)
      request.server.methods.achievement.checkUserStandDay(request.params.attendeeId)
      return h.response(render(user, request.auth.credentials && request.auth.credentials.user))
    } catch (err) {
      log.error({ err: err, msg: 'error creating signature' }, 'error creating signature')
      return Boom.boomify(err)
    }
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
    description: 'Creates a new signature for speed dates'
  },
  handler: async function (request, h) {
    try {
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.payload.editionId)
      let happyHours = await request.server.methods.happyHour.get()
      let achievement = await request.server.methods.achievement.addUserToSpeedDateAchievement(request.params.companyId, request.params.attendeeId, happyHours)
      return h.response(achievement)
    } catch (err) {
      log.error({ err: err, msg: 'error creating signature for speed dating' }, 'error creating signature for speed dating')
      return Boom.boomify(err)
    }
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
    description: 'Perform check-in in a session for an array of users, giving its achievement to each of them'
  },
  handler: async function (request, h) {
    try {
      let achievement = request.server.methods.achievement.addMultiUsersBySession(request.params.sessionId, request.payload.users, request.auth.credentials, request.payload.code, request.payload.unregisteredUsers)
      return h.response(achievement)
    } catch (err) {
      log.error({ err: err, msg: 'error checking in session for users' }, 'error checking in session for users')
      return Boom.boomify(err)
    }
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
    description: 'Generate a temporary code for user-side check in'
  },
  handler: async function (request, h) {
    try {
      let achievement = await request.server.methods.achievement.generateCodeSession(request.params.sessionId, request.payload.expiration)
      return h.response(achievement)
    } catch (err) {
      log.error({ err: err, msg: 'error checking in session for users' }, 'error checking in session for users')
      return Boom.boomify(err)
    }
  },
}
