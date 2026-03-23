const Joi = require('joi')
const renderCompanies = require('../../views/company')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

exports = module.exports

exports.getPartners = {
    options: {
        tags: ['api', 'partner'],
        validate: {
            query: Joi.object({
                edition: Joi.string().description('Event edition id (defaults to latest)')
            })
        },
        description: 'Gets all partners (filters only partner companies) for a specific edition (defaults to latest)'
    },
    handler: async (request, h) => {
        try {
            const edition = request.query && request.query.edition ? request.query.edition : (await request.server.methods.deck.getLatestEdition()).id
            const companies = await request.server.methods.deck.getCompanies(edition)
            const partners = companies.filter(c => c.partner === true)
            return h.response(renderCompanies(partners))
        } catch (err) {
            log.error({ err: err}, 'error getting partners')
            throw Boom.internal()
        }
    }
}
