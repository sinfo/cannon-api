const Joi = require('joi')
const render = require('../../views/user')

exports = module.exports

exports.create = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    payload: {
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
      points: {
        available: Joi.number().description('Points available to use'),
        total: Joi.number().description('Total points earned')
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
    }
  },
  pre: [
    { method: 'user.create(payload)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user)).created('/user/' + request.pre.user.id)
  },
  description: 'Creates a new user'
}

exports.updateMe = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  validate: {
    payload: {
      // id: Joi.string().description('Id of the user'),
      name: Joi.string().description('Name of the user'),
      img: Joi.string().uri().description('Image of the user'),
      mail: Joi.string().email().description('Mail of the user'),
      area: Joi.string().description('Work field of the user'),
      skills: Joi.array().description('Skills of the user'),
      job: Joi.object().keys({
        startup: Joi.boolean().description('Interested in a startup'),
        internship: Joi.boolean().description('Interested in internship'),
        start: Joi.date().description('Available for hire')
      })
    }
  },
  pre: [
    { method: 'user.update(auth.credentials.user.id, payload)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Updates the user'
}

exports.update = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    payload: {
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
      points: {
        available: Joi.number().description('Points available to use'),
        total: Joi.number().description('Total points earned')
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
    }
  },
  pre: [
    { method: 'user.update(params.id, payload)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Updates an user'
}

exports.get = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin'],
    mode: 'try'
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the user we want to retrieve')
    }
  },
  pre: [
    { method: 'user.get(params.id, query)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Gets an user'
}

exports.getMe = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  handler: function (request, reply) {
    reply(render(request.auth.credentials && request.auth.credentials.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Gets the user'
}

exports.list = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin'],
    mode: 'try'
  },
  validate: {
    query: {
      fields: Joi.string().description('Fields we want to retrieve'),
      sort: Joi.string().description('Sort fields we want to retrieve'),
      skip: Joi.number().description('Number of documents we want to skip'),
      limit: Joi.number().description('Limit of documents we want to retrieve')
    }
  },
  pre: [
    { method: 'user.list(query)', assign: 'users' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.users, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Gets all the users'
}

exports.remove = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the user we want to remove')
    }
  },
  pre: [
    { method: 'user.remove(params.id)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials.user))
  },
  description: 'Removes an user'
}

exports.removeMe = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  pre: [
    { method: 'user.remove(auth.credentials.user.id)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Removes the user'
}
