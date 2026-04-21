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
      const companyId = request.params.companyId
      log.info({ companyId, edition: latestEdition.id }, 'Fetching company download urls')
      const downloadLinks = await request.server.methods.url.get(companyId, latestEdition.id)
      return h.response(render(downloadLinks))
    } catch (err) {
      log.error({
        err,
        companyId: request.params.companyId,
        edition: (typeof latestEdition !== 'undefined' && latestEdition.id) ? latestEdition.id : undefined,
        message: err && err.message,
        stack: err && err.stack,
        boom: err && err.isBoom ? err : undefined
      }, 'Error getting company download urls')
      throw Boom.internal()
    }
  },
}
