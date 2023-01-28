const Joi = require('joi')
const render = require('../../views/redeem')
const renderAchievement = require('../../views/achievement')
const Boom = require('@hapi/boom');
const log = require('../../helpers/logger')

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
    description: 'Creates a new Redeem Code.'
  },
  handler: async function (request, h) {
    try {
      let redeem = await request.server.methods.redeem.create(request.payload)
      return h.response(render(redeem)).created()
    } catch (err) {
      log.error({ err: err, msg:'error creating redeem code'}, 'error creating redeem code')
      throw Boom.boomify(err)
    }
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
    description: 'Uses a redeem code to get an achievement'
  },
  handler: async function (request, h) {
    try {
      let redeem = await request.server.methods.redeem.get(request.params.id)
      await request.server.methods.redeem.use(redeem, request.auth.credentials.user.id)
      let achievement = await request.server.methods.achievement.addUser(redeem.achievement, request.auth.credentials.user.id)
      return h.response({ success: true, achievement: renderAchievement(achievement)})
    } catch (err) {
      log.error({ err: err, msg:'error getting redeem code'}, 'error getting redeem code')
      throw Boom.boomify(err)
    }
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
    description: 'Removes a redeem code'
  },
  handler: async function (request, h) {
    try {
      let redeem = await request.server.methods.redeem.remove(request.params.id)
      return h.response(redeem)
    } catch (err) {
      log.error({ err: err, msg:'error removing redeem code'}, 'error removing redeem code')
      throw Boom.boomify(err)
    }
  },
}
