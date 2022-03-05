const Joi = require('joi')
const render = require('../../views/endpoint')

exports = module.exports

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
      if (err.code === 11000) {
        log.error({ msg: "company is a duplicate" })
        return Boom.conflict(`company "${comp.id}" is a duplicate`)
      }

      log.error({ err: err, msg: 'error creating company' }, 'error creating company')
      return Boom.internal()
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
      let comp = await request.server.methods.endpoint.update(request.params.id, request.payload)
      if (!comp) {
        log.error({ err: err, company: filter }, 'error updating company')
        return Boom.notFound()
      }
      return h.response(render(comp))
    } catch (err) {
      log.error({ err: err, company: filter }, 'error updating company')
      return Boom.internal()
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
      let comp = await request.server.methods.endpoint.get(request.params.id)
      if (!comp) {
        log.error({ err: err, company: filter }, 'error getting company')
        return Boom.notFound()
      }
      return h.response(render(comp))
    } catch (err) {
      log.error({ err: err, company: filter }, 'error getting company')
      return Boom.internal()
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
      return Boom.boomify(err)
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
      let comp = await request.server.methods.endpoint.remove(request.params.id)
      if (!comp) {
        log.error({ id: request.params.id, error: err })
        return Boom.notFound('company not found')
      }
      return h.response(render(comp))
    } catch (err) {
      log.error({ info: request.info, error: err })
      return Boom.boomify(err)
    }
  },
}
