const Joi = require('joi')
const render = require('../../views/endpoint')
const renderCompanies = require('../../views/company')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

exports = module.exports

exports.getAll = {
  options: {
    tags: ['api', 'company-endpoint'],
    description: 'Gets all companies for the latest edition'
  },
  handler: async (request, h) => {
    try {
      const latestEdition = await request.server.methods.deck.getLatestEdition()
      const companies = await request.server.methods.deck.getCompanies(latestEdition)
      return h.response(renderCompanies(companies))
    } catch (err) {
      log.error({ err: err}, 'error getting company')
      throw Boom.internal()
    }
  },
}

exports.getCompany = {
  options: {
    tags: ['api', 'company-endpoint'],
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description('Id of the company')
      })
    },
    description: 'Gets specific company'
  },
  handler: async (request, h) => {
    try {
      const company = await request.server.methods.deck.getCompany(request.params.companyId)
      return h.response(renderCompanies(company))
    } catch (err) {
      log.error({ err: err}, 'error getting company')
      throw Boom.internal()
    }
  },
}

exports.create = {
  options: {
    tags: ['api', 'company-endpoint'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      payload: Joi.object({
        companies: Joi.array().required().items(Joi.string()).description('Id of the companies'),
        edition: Joi.string().required().description('Event the endpoint is associated to'),
        validity: {
          from: Joi.date().description('Date of endpoint validity period start.'),
          to: Joi.date().description('Date of endpoint validity period end.')
        }
      })
    },
    description: 'Creates a new company endpoint'
  },
  handler: async (request, h) => {
    try {
      let comp = await request.server.methods.endpoint.create(request.payload)
      return h.response(render(comp)).created('/company-endpoint/' + comp.id)
    } catch (err) {
      log.error({ err: err, msg: 'error creating company' }, 'error creating company')
      throw Boom.boomify(err)
    }
  },
}

exports.update = {
  options: {
    tags: ['api', 'company-endpoint'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description('Id of the company')
      }),
      query: Joi.object({
        edition: Joi.string().required().description('Event the endpoint is associated to')
      }),
      payload: Joi.object({
        validity: Joi.object({
          from: Joi.date().description('Date of endpoint validity period start.'),
          to: Joi.date().description('Date of endpoint validity period end.')
        })
      })
    },
    description: 'Updates a company endpoint'
  },
  handler: async (request, h) => {
    try {
      let comp = await request.server.methods.endpoint.update(request.params.companyId, request.query, request.payload)
      if (!comp) {
        log.error({ err: err }, 'error updating company')
        throw Boom.notFound()
      }
      return h.response(render(comp))
    } catch (err) {
      log.error({ err: err}, 'error updating company')
      throw Boom.internal()
    }

  },
}

exports.get = {
  options: {
    tags: ['api', 'company-endpoint'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description('Id of the company')
      }),
      query: Joi.object({
        edition: Joi.string().required().description('Event the endpoint is associated to')
      })
    },
    description: 'Gets a company endpoint'
  },
  handler: async (request, h) => {
    try {
      let comp = await request.server.methods.endpoint.get(request.params.companyId, request.query)
      return h.response(render(comp))
    } catch (err) {
      log.error({ err: err}, 'error getting company')
      throw Boom.internal()
    }
  },
}

exports.list = {
  options: {
    tags: ['api', 'company-endpoint'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      query: Joi.object({
        edition: Joi.string().required().description('Event the endpoints are associated to'),
        fields: Joi.string().description('Fields we want to retrieve'),
        sort: Joi.string().description('Sort fields we want to retrieve'),
        skip: Joi.number().description('Number of documents we want to skip'),
        limit: Joi.number().description('Limit of documents we want to retrieve')
      })
    },
    description: 'Gets all company endpoints'
  },
  handler: async (request, h) => {
    try {
      let endpoint = await request.server.methods.endpoint.list(request.query)
      return h.response(render(endpoint))
    } catch (err) {
      log.error({ err: err }, 'Error finding endpoints')
      throw Boom.boomify(err)
    }
  },
}

exports.remove = {
  options: {
    tags: ['api', 'company-endpoint'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description('Id of the company')
      }),
      query: Joi.object({
        edition: Joi.string().required().description('Event the endpoint is associated to')
      })
    },
    description: 'Removes a company endpoint'
  },
  handler: async (request, h) => {
    try {
      let comp = await request.server.methods.endpoint.remove(request.params.companyId, request.query.edition)
      if (!comp) {
        log.error({ id: request.params.id, error: err })
        throw Boom.notFound('company not found')
      }
      return h.response(render(comp))
    } catch (err) {
      log.error({ info: request.info, error: err })
      throw Boom.boomify(err)
    }
  },
}
