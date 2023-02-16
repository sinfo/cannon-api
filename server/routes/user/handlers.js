const Joi = require('joi')
const render = require('../../views/user')
const renderMembers = require('../../views/member')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')
const dupKeyParser = require('../../helpers/dupKeyParser')


exports = module.exports

exports.getMembers = {
  options: {
    tags: ['api', 'member'],
    description: 'Get members'
  },
  handler: async (request, h) => {
    try {
      const members = await request.server.methods.deck.getMembers()
      return h.response(renderMembers(members))
    } catch(err) {
      log.error({ error: err })
      throw Boom.boomify(err)
    }
  }
}

exports.create = {
  options: {
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['admin']
    },
    validate: {
      payload: Joi.object({
        id: Joi.string().description('Id of the user'),
        name: Joi.string().required().description('Name of the user'),
        img: Joi.string().uri().description('Image of the user'),
        role: Joi.string().description('Role of the user'),
        mail: Joi.string().email().required().description('Mail of the user'),
        bearer: Joi.array().items(Joi.object({
          token: Joi.string().token().description('Bearer token'),
          refreshToken: Joi.string().token().description('Bearer refresh token'),
          ttl: Joi.number().description('Bearer token time to live'),
          date: Joi.date().description('Bearer date of creation')
        })),
        company: Joi.array().items(Joi.object().keys({
          edition: Joi.string().description('id of the event edition'),
          company: Joi.string().description('id of the company')
        })),
        facebook: {
          id: Joi.string().description('Facebook id of the user'),
          token: Joi.string().token().description('Facebook token of the user')
        },
        google: {
          id: Joi.string().description('Google id of the user'),
          token: Joi.string().token().description('Google token of the user')
        },
        fenix: {
          id: Joi.string().description('Fenix id of the user'),
          token: Joi.string().token().description('Fenix token of the user'),
          refreshToken: Joi.string().token().description('Fenix refresh token of the user'),
          ttl: Joi.number().description('Fenix token time to live'),
          created: Joi.date().description('Fenix token creation date')
        },
        achievements: Joi.array().items(Joi.object().keys({
          id: Joi.string().description('id of the earned achievement'),
          date: Joi.date().description('date of its receipt')
        })),
        area: Joi.string().description('Work field of the user'),
        skills: Joi.array().description('Skills of the user'),
        job: Joi.object().keys({
          startup: Joi.boolean().description('Interested in a startup'),
          internship: Joi.boolean().description('Interested in internship'),
          start: Joi.date().description('Available for hire')
        }),
        registered: Joi.date().description('Date of register'),
        updated: Joi.date().description('Last update')
      })
    },
    description: 'Creates a new user'
  },
  handler: async (request, h) =>{
    try {
      let user = await request.server.methods.user.create(request.payload)
  
      return h.response(render(user, request.auth.credentials && request.auth.credentials.user)).created('/user/' + user.id)
    } catch (err) {
      if (err.code === 11000) {
        log.warn({ err: err }, 'user is a duplicate')
        throw Boom.conflict('user is a duplicate')
      }

      log.error({ err: err }, 'error creating user')
      throw Boom.boomify(err)
    }
  }
}

exports.updateMe = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin']
    },
    validate: {
      payload: Joi.object({
        name: Joi.string().description('Name of the user'),
        img: Joi.string().uri().description('Image of the user'),
        mail: Joi.string().email().description('Mail of the user'),
        area: Joi.string().description('Work field of the user'),
        role: Joi.string().description('Use to demote self to user'),
        skills: Joi.array().description('Skills of the user'),
        job: Joi.object().keys({
          startup: Joi.boolean().description('Interested in a startup'),
          internship: Joi.boolean().description('Interested in internship'),
          start: Joi.date().description('Available for hire')
        })
      })
    },
    description: 'Updates the user'
  },
  handler: async (request, h) =>{
    try {
      let user = await request.server.methods.user.updateMe(request.auth.credentials.user.id, request.payload)
      if (!user) {
        log.error({ err: err, requestedUser: filter }, 'user not found')
        throw Boom.notFound()
      }
      return h.response(render(user, request.auth.credentials && request.auth.credentials.user))
    } catch (err) {
      if (err) {
        log.error({ err: err }, 'error updating user')
        throw Boom.boomify(err)
      }
    }
  },
}

exports.find = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin'],
      mode: 'try'
    },
    validate: {
      query: Joi.object({
        date: Joi.date().description('all users\' points on this date')
      })
    },
    description: 'Gets users with active achievements sorted by points'
  },
  handler: async (request, h) => {
    try {
      let activeAchievements = await request.server.methods.achievement.getActiveAchievements(request.query)
      let users = await request.server.methods.user.list(activeAchievements)
      return h.response(render(users, request.auth.credentials && request.auth.credentials.user))
    } catch (err) {
      log.error({ err: err }, 'error getting all users')
      throw Boom.boomify(err)
    }
  },
}

exports.update = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      payload: Joi.object({
        id: Joi.string().description('Id of the user'),
        name: Joi.string().description('Name of the user'),
        img: Joi.string().uri().description('Image of the user'),
        role: Joi.string().description('Role of the user'),
        mail: Joi.string().email().description('Mail of the user'),
        bearer: Joi.array().items(Joi.object({
          token: Joi.string().token().description('Bearer token'),
          refreshToken: Joi.string().token().description('Bearer refresh token'),
          ttl: Joi.number().description('Bearer token time to live'),
          date: Joi.date().description('Bearer date of creation')
        })),
        company: Joi.object().keys({
          edition: Joi.string().description('id of the event edition'),
          company: Joi.string().description('id of the company')
        }),
        facebook: {
          id: Joi.string().description('Facebook id of the user'),
          token: Joi.string().token().description('Facebook token of the user')
        },
        google: {
          id: Joi.string().description('Google id of the user'),
          token: Joi.string().token().description('Google token of the user')
        },
        fenix: {
          id: Joi.string().description('Fenix id of the user'),
          token: Joi.string().token().description('Fenix token of the user'),
          refreshToken: Joi.string().token().description('Fenix refresh token of the user'),
          ttl: Joi.number().description('Fenix token time to live'),
          created: Joi.date().description('Fenix token creation date')
        },
        achievements: Joi.array().items(Joi.object().keys({
          id: Joi.string().description('id of the earned achievement'),
          date: Joi.date().description('date of its receipt')
        })),
        area: Joi.string().description('Work field of the user'),
        skills: Joi.array().description('Skills of the user'),
        job: Joi.object().keys({
          startup: Joi.boolean().description('Interested in a startup'),
          internship: Joi.boolean().description('Interested in internship'),
          start: Joi.date().description('Available for hire')
        }),
        registered: Joi.date().description('Date of register'),
        updated: Joi.date().description('Last update')
      })
    },
    description: 'Updates an user'
  },
  handler: async (request, h) => {
    try {
      let user = await request.server.methods.user.update(request.params.id, request.payload)
      if (!user) {
        log.error({ err: err}, 'user not found')
        throw Boom.notFound()
      }
      return h.response(render(user, request.auth.credentials && request.auth.credentials.user))
    } catch (err) {
        log.error({ err: err}, 'error updating user')
        throw Boom.boomify(err)
    }
  },
}

exports.get = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin'],
      mode: 'try'
    },
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('Id of the user we want to retrieve')
      })
    },
    description: 'Gets an user'
  },
  handler: async (request, h) => {
    try {
      let user = await request.server.methods.user.get(request.params.id)
      if (!user) {
        log.error('user not found')
        throw Boom.notFound()
      }
      return h.response(render(user, request.auth.credentials && request.auth.credentials.user))
    } catch (err){
      log.error({ err: err}, 'error getting user')
      throw Boom.boomify(err)
    }
  },
}

exports.getMulti = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin'],
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        users: Joi.array().required().description('An array of users IDs')
      })
    },
    description: 'Gets an array of users'
  },
  handler: async (request, h) => {
    try{
      let users = await request.server.methods.user.getMulti(request.payload.users)
      return h.response(render(users, request.auth.credentials && request.auth.credentials.user))
    } catch (err)  {
      log.error({ err: err }, 'error getting multiple users')
      throw Boom.boomify(err)
    }
  },
}

exports.getMe = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      access:{
        scope: ['user', 'company', 'team', 'admin']
      }
    },
    description: 'Gets the user'
  },
  handler: async (request, h) => {
    return h.response(render(request.auth.credentials && request.auth.credentials.user, request.auth.credentials && request.auth.credentials.user))
  },
}

exports.removeCompany = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('Id of the user we want to remove')
      }),
      query: Joi.object({
        editionId: Joi.string().required().description('Id of the edition of the participation you want to remove')
      })
    },
  },
  handler: async (request, h) => {
    try {
      let user = await request.server.methods.user.removeCompany(request.params.id, request.query.editionId)
      return h.response(render(user, request.auth.credentials.user))
    } catch(err){
      log.error({ err: err}, 'error deleting user.company')
      throw Boom.boomify(err)
    }
  },
}

exports.remove = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['admin']
    },
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('Id of the user we want to remove')
      })
    },
    description: 'Removes an user'
  },
  handler: async (request, h) => {
    try{
      let user = await request.server.methods.user.remove(request.params.id)
      return h.response(render(user, request.auth.credentials.user))
    }catch(err){
      log.error({ err: err}, 'error deleting user')
      throw Boom.boomify(err)
    }
  },
}

exports.removeMe = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin']
    },
    description: 'Removes the user'
  },
  handler: async (request, h) => {
    try{
      let user = await request.server.methods.user.remove(request.auth.credentials.user.id)
      h.response(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
    }catch(err){
      log.error({ err: err}, 'error deleting user')
      throw Boom.boomify(err)
    }
  },
}

exports.redeemCard = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('Id of the user we want to redeem the card from')
      }),
      payload: Joi.object({
        day: Joi.string().required().description('ISO Date of the day you are redeeming the card from'),
        editionId: Joi.string().required().description('Id of the current edition')
      })
    },
    description: 'Clears Users Card Signatures for the day'
  },
  handler: async (request, h) => {
    try{
      let user = await request.server.methods.user.redeemCard(request.params.id, request.payload)
      return h.response(render(user, request.auth.credentials && request.auth.credentials.user))
    }catch(err){
      log.error({err: err}, 'error redeeming card')
      throw Boom.boomify(err)
    }
  },
}
