const Joi = require('joi')
const render = require('../../views/user')

exports = module.exports

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
      h.response(render(user, request.auth.credentials && request.auth.credentials.user)).created('/user/' + request.pre.user.id)
    } catch (err) {
      if (err.code === 11000) {
        log.warn({ err: err, requestedUser: user.id }, 'user is a duplicate')
        return Boom.conflict(dupKeyParser(err.err) + ' is a duplicate')
      }

      log.error({ err: err, user: user.id }, 'error creating user')
      return Boom.internal()
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
  handler: async (request, reply) =>{
    try {
      let user = await user.updateMe(auth.credentials.user.id, request.payload)
      h.response(render(user, request.auth.credentials && request.auth.credentials.user))
      if (!user) {
        log.error({ err: err, requestedUser: filter }, 'user not found')
        return Boom.notFound()
      }
    } catch (err) {
      if (err) {
        log.error({ err: err, requestedUser: filter }, 'error updating user')
        return Boom.internal()
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
      let activeAchievements = await request.server.methods.achievement.getActiveAchievements(query)
      let users = request.server.methods.user.list(activeAchievements)
      return h.response(render(users, request.auth.credentials && request.auth.credentials.user))
    } catch (err) {
      log.error({ err: err }, 'error getting all users')
      return Boom.internal()
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
      let user = await user.update(request.payload.id, request.payload)
      if (!user) {
        log.error({ err: err, requestedUser: filter }, 'user not found')
        return Boom.notFound()
      }
      h.response(render(user, request.auth.credentials && request.auth.credentials.user))
    } catch (err) {
      if (err) {
        log.error({ err: err, requestedUser: filter }, 'error updating user')
        return Boom.internal()
      }
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
      let user = request.server.methods.user.get(request.params.id)
      if (!user) {
        log.error({ err: err, requestedUser: filter }, 'user not found')
        return Boom.notFound()
      }
      h.response(render(user, request.auth.credentials && request.auth.credentials.user))
    } catch {

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
      let users = user.getMulti(request.payload.users)
      return h.response(render(users, request.auth.credentials && request.auth.credentials.user))
    } catch (err)  {
      log.error({ err: err, ids: ids }, 'error getting multiple users')
      return Boom.internal()
    }
  },
}

exports.getMe = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin']
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
      let user = await user.removeCompany(request.params.id, request.query.editionId)
      return h.response(render(user, request.auth.credentials.user))
    } catch(err){
      log.error({ err: err, requestedUser: filter, edition: editionId }, 'error deleting user.company')
      return cb(Boom.internal())
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
    pre: [
      { method: 'user.remove(params.id)', assign: 'user' }
    ],
    description: 'Removes an user'
  },
  handler: async (request, h) => {
    return h.response(render(request.pre.user, request.auth.credentials.user))
  },
}

exports.removeMe = {
  options:{
    tags: ['api', 'user'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin']
    },
    pre: [
      { method: 'user.remove(auth.credentials.user.id)', assign: 'user' }
    ],
    description: 'Removes the user'
  },
  handler: async (request, h) => {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
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
    pre: [
      { method: 'user.redeemCard(params.id, payload)', assign: 'user' }
    ],
    description: 'Clears Users Card Signatures for the day'
  },
  handler: async (request, h) => {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
}
