const Joi = require('joi')
const render = require('../../views/url')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

exports = module.exports

exports.get = {
  options: {
    tags: ['api', 'company-endpoint'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin', 'company']
    },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description('Id of the company')
      }),
    },
    description: 'Gets a company download urls'
  },
  handler: async (request, h) => {
    try {
      const latestEdition = await request.server.methods.deck.getLatestEdition()
      const downloadLinks = await request.server.methods.url.get(request.params.companyId, latestEdition.id)
      return h.response(render(downloadLinks))
    } catch (err) {
      log.error({ err: err}, 'error getting company')
      throw Boom.internal()
    }
  },
}
