const Joi = require('joi')
const render = require('../../views/achievement')

exports = module.exports

exports.create = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['admin']
  },
  validate: {
    payload: {
      id: Joi.string().description('Id of the achievement'),
      name: Joi.string().required().description('Name of the achievement'),
      event: Joi.string().default('22').description('Event the achievement is associated to'),
      session: Joi.string().description('Id of a session associated to this achievement'),
      img: Joi.string().description('Image of the achievement'),
      description: Joi.string().description('Description of the achievement'),
      category: Joi.string().description('Category of the achievement'),
      instructions: Joi.string().description('Instructions on how to get the achievement'),
      value: Joi.number().description('Amount of points associated to the achievement'),
      validity: Joi.object().keys({
        from: Joi.date().description('Date when the achievement starts being available for grabs'),
        to: Joi.date().description('Date when the achievement starts stops being available for grabs')
      }),
      kind: Joi.string().description('Kind of achievement (cv, for example)')
    }
  },
  pre: [
    { method: 'achievement.create(payload)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievement)).created('/achievement/' + request.pre.achievement.id)
  },
  description: 'Creates a new achievement'
}

exports.update = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the achievement we want to update')
    },
    payload: {
      name: Joi.string().description('Name of the achievement'),
      event: Joi.string().description('Event the achievement is associated to'),
      session: Joi.string().description('Id of a session associated to this achievement'),
      category: Joi.string().description('Category of the achievement'),
      description: Joi.string().description('Description of the achievement'),
      instructions: Joi.string().description('Instructions on how to get the achievement'),
      img: Joi.string().description('Image of the achievement'),
      value: Joi.number().description('Amount of points associated to the achievement'),
      validity: Joi.object().keys({
        from: Joi.date().description('Date when the achievement starts being available for grabs'),
        to: Joi.date().description('Date when the achievement starts stops being available for grabs')
      })
    }
  },
  pre: [
    { method: 'achievement.update(params.id, payload)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievement))
  },
  description: 'Updates an achievement'
}

exports.get = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: {
      fields: Joi.string().description('Fields we want to retrieve')
    },
    params: {
      id: Joi.string().required().description('Id of the achievement we want to retrieve')
    }
  },
  pre: [
    { method: 'achievement.get(params.id)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievement))
  },
  description: 'Gets an achievement'
}

exports.getMe = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  pre: [
    { method: 'achievement.getByUser(auth.credentials.user.id)', assign: 'achievements' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievements))
  },
  description: 'Gets my achievements'
}

exports.removeMe = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  pre: [
    { method: 'achievement.removeAllFromUser(auth.credentials.user.id)', assign: 'achievements' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievements))
  },
  description: 'Removes all my achievements'
}

exports.getActive = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: {
      date: Joi.date().description('all achievements active on this date')
    }
  },
  pre: [
    { method: 'achievement.getActiveAchievements(query)', assign: 'activeAchievements' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.activeAchievements))
  },
  description: 'Gets active achievements'
}

exports.getMeActive = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  pre: [
    { method: 'achievement.getActiveAchievements()', assign: 'activeAchievements' },
    { method: 'achievement.getPointsForUser(pre.activeAchievements, auth.credentials.user.id)', assign: 'result' }
  ],
  handler: function (request, reply) {
    reply(request.pre.result)
  },
  description: 'Gets my active achievements and my points'
}

exports.getMeSpeed = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  pre: [
    {method: 'achievement.getSpeedDatePointsForUser(auth.credentials.user.id)', assign: 'result'}
  ],
  handler: function (request, reply) {
    reply(request.pre.result)
  },
  description: 'Gets my speed dating achievements'
}

exports.getUser = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: {
      fields: Joi.string().description('Fields we want to retrieve')
    },
    params: {
      id: Joi.string().required().description('Id of the user we want to retrieve')
    }
  },
  pre: [
    { method: 'achievement.getByUser(params.id)', assign: 'achievements' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievements))
  },
  description: 'Gets user achievements'
}

exports.list = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
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
    { method: 'achievement.list(query)', assign: 'achievements' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievements))
  },
  description: 'Gets all the achievements'
}

exports.remove = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the achievement we want to remove')
    }
  },
  pre: [
    { method: 'achievement.remove(params.id)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievement))
  },
  description: 'Removes an achievement'
}

exports.listWithCode = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: {
      start: Joi.date().description('Start of validity period'),
      end: Joi.date().description('End of validity period'),
      kind: Joi.string().description('Kind of achievements we want')
    }
  },
  pre: [
    {method: 'achievement.getActiveAchievementsCode(query)', assign: 'achievements'}
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievements, true))
  },
  description: 'Lists all achievements, with self sign codes'
}
exports.getWithCode = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: {
      fields: Joi.string().description('Fields we want to retrieve')
    },
    params: {
      id: Joi.string().required().description('Id of the achievement we want to retrieve')
    }
  },
  pre: [
    { method: 'achievement.get(params.id)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievement, true))
  },
  description: 'Gets an achievement, with self sign codes'
}

exports.createSecret = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    payload: {
      validity: Joi.date().description('Date when the achievement starts stops being available for grabs').required(),
      event: Joi.string().description('Event the achievement is associated to').required(),
      points: Joi.number().description('Value of the achievement').required()
    }
  },
  pre: [
    { method: 'achievement.createSecret(payload)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.achievement, true)).created('/achievement/' + request.pre.achievement.id)
  },
  description: 'Creates a new secret achievement'
}

exports.signSecret = {
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin', 'user'],
    mode: 'try'
  },
  validate: {
    payload: {
      code: Joi.string().description('Validation code for self signing')
    }
  },
  pre: [
    { method: 'achievement.addUserToSecret(auth.credentials.user.id, payload.code)', assign: 'achievement' }
  ],
  handler: function (request, reply) {
    reply(request.pre.achievement)
  },
  description: 'Perform check-in in a session for an array of users, giving its achievement to each of them'
}

