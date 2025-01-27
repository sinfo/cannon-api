const Joi = require('joi')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')
const configUpload = require('../../../config').upload
const render = require('../../views/prize')

exports = module.exports

exports.create = {
  options: {
    tags: ['api', 'prize'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    payload: {
      output: 'stream',
      multipart: true,
      parse: true,
      allow: 'multipart/form-data',
      maxBytes: configUpload.maxSize
    },
    validate: {
      payload: Joi.object({
        id: Joi.string().description('Id of the prize'),
        name: Joi.string().required().description('Name of the prize'),
        img: Joi.any().meta({ swaggerType: 'file' }).required().description('Image of the prize'),
        sessions: Joi.array().items(Joi.string()).description('Id of a session associated to this prize'),
        days: Joi.array().items(Joi.string()).description('Days when this prize will be drawn'),
        cv: Joi.boolean().description('Is this prize to CV')
      })
    },
    description: 'Creates a new prize'
  },
  handler: async (request, h) => {
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      const prize = await request.server.methods.prize.create(request.payload, edition.id)
      return h.response(render(prize)).created('/prize/' + prize.id)
    } catch (err) {
      log.error({ err: err, msg: 'error creating prize' }, 'error creating prize')
      throw Boom.boomify(err)
    }
  }
}

exports.list = {
  options: {
    tags: ['api', 'prize'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin'],
      mode: 'try'
    },
    validate: {
      query: Joi.object({
        edition: Joi.string().description('id of the event edition'),
      })
    },
    description: 'Gets all the prizes by edition'
  },
  handler: async function (request, h) {
    try {
      const editionId = request.query.edition || (await request.server.methods.deck.getLatestEdition()).id
      const prizes = await request.server.methods.prize.list(editionId)
      return h.response(render(prizes))
    }catch(err){
      log.error({err: err}, 'Error finding prizes')
      throw Boom.boomify(err)
    }
  },
}
