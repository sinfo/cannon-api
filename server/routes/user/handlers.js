const Joi = require('joi')
const render = require('../../views/user')

exports = module.exports

exports.create = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default'],
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
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  validate: {
    payload: {
      // id: Joi.string().description('Id of the user'),
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
    }
  },
  pre: [
    { method: 'user.updateMe(auth.credentials.user.id, payload)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Updates the user'
}

exports.update = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
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
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
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

exports.getMulti = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    payload: {
      users: Joi.array().required().description('An array of users IDs')
    }
  },
  pre: [
    { method: 'user.getMulti(payload.users)', assign: 'users' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.users, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Gets an array of users'
}

exports.getMe = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  handler: function (request, reply) {
    reply(render(request.auth.credentials && request.auth.credentials.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Gets the user'
}


exports.removeCompany = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the user we want to remove')
    },
    query: {
      editionId: Joi.string().required().description('Id of the edition of the participation you want to remove')
    }
  },
  pre: [
    { method: 'user.removeCompany(params.id, query.editionId)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials.user))
  },
  description: 'Removes company from a user'
}

exports.remove = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default'],
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
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  pre: [
    { method: 'user.remove(auth.credentials.user.id)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Removes the user'
}

exports.redeemCard = {
  tags: ['api', 'user'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the user we want to redeem the card from')
    },
    payload: {
      day: Joi.string().required().description('ISO Date of the day you are redeeming the card from'),
      editionId: Joi.string().required().description('Id of the current edition')
    }
  },
  pre: [
    { method: 'user.redeemCard(params.id, payload)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Clears Users Card Signatures for the day'
}
