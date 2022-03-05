const Joi = require('joi')
const render = require('../../views/redeem')
const renderAchievement = require('../../views/achievement')

exports = module.exports

exports.create = {
  options:{
    tags: ['api', 'redeem'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      payload: Joi.object({
        id: Joi.string().required().description('Redeem Code id.'),
        achievement: Joi.string().required().description('Achievement you want to redeem.'),
        expires: Joi.date().description('Date of redeem code expiration.')
      })
    },
    pre: [
      { method: 'redeem.create(payload)', assign: 'redeem' }
    ],
    description: 'Creates a new Redeem Code.'
  },
  handler: function (request, reply) {
    reply(render(request.pre.redeem)).created('/redeem/' + request.pre.redeem.id)
  },
}

exports.get = {
  options:{
    tags: ['api', 'redeem'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'team', 'admin']
    },
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('Id of the redeem code we want to retrieve')
      })
    },
    pre: [
      { method: 'redeem.get(params.id)', assign: 'redeem' },
      { method: 'redeem.use(pre.redeem, auth.credentials.user.id)' },
      { method: 'achievement.addUser(pre.redeem.achievement, auth.credentials.user.id)', assign: 'achievement' }
    ],
    description: 'Uses a redeem code to get an achievement'
  },
  handler: function (request, reply) {
    reply({
      success: true,
      achievement: renderAchievement(request.pre.achievement)
    })
  },
}

exports.remove = {
  options:{
    tags: ['api', 'redeem'],
    auth: {
      strategies: ['default'],
      scope: ['admin']
    },
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('Id of the redeem code we want to remove')
      })
    },
    pre: [
      { method: 'redeem.remove(params.id)', assign: 'redeem' }
    ],
    description: 'Removes a redeem code'
  },
  handler: function (request, reply) {
    reply(request.pre.redeem)
  },
}
