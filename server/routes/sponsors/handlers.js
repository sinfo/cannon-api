const Joi = require('joi')
const renderCompanies = require('../../views/company')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

exports = module.exports

exports.getSponsors = {
    options: {
        tags: ['api', 'sponsor'],
        validate: {
            query: Joi.object({
                edition: Joi.string().description('Event edition id (defaults to latest)')
            })
        },
        description: 'Gets all sponsors (filters out partners) for a specific edition (defaults to latest)'
    },
    handler: async (request, h) => {
        try {
            const edition = request.query && request.query.edition ? request.query.edition : (await request.server.methods.deck.getLatestEdition()).id
            const companies = await request.server.methods.deck.getCompanies(edition)

            const sponsors = companies.filter(c => c.partner !== true && c.partner !== 'true' && c.advertisementLvl !== 'other')
            return h.response(renderCompanies(sponsors))
        } catch (err) {
            log.error({ err: err}, 'error getting sponsors')
            throw Boom.internal()
        }
    }
}
