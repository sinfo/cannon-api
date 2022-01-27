const Joi = require('joi')
const render = require('../../views/endpoint')

exports = module.exports

exports.create = {
  tags: ['api', 'company-endpoint'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    payload: {
      companies: Joi.array().required().items(Joi.string()).description('Id of the companies'),
      edition: Joi.string().required().description('Event the endpoint is associated to'),
      validity: {
        from: Joi.date().description('Date of endpoint validity period start.'),
        to: Joi.date().description('Date of endpoint validity period end.')
      }
    }
  },
  pre: [
    { method: 'endpoint.create(payload)', assign: 'endpoints' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.endpoints)).created('/company-endpoint') // will reply all, not just the created
  },
  description: 'Creates a new company endpoint'
}

exports.update = {
  tags: ['api', 'company-endpoint'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Id of the company')
    },
    query: {
      edition: Joi.string().required().description('Event the endpoint is associated to')
    },
    payload: {
      validity: {
        from: Joi.date().description('Date of endpoint validity period start.'),
        to: Joi.date().description('Date of endpoint validity period end.')
      }
    }
  },
  pre: [
    { method: 'endpoint.update(params.companyId, query.edition, payload)', assign: 'endpoint' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.endpoint))
  },
  description: 'Updates a company endpoint'
}

exports.get = {
  tags: ['api', 'company-endpoint'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Id of the company')
    },
    query: {
      edition: Joi.string().required().description('Event the endpoint is associated to')
    }
  },
  pre: [
    { method: 'endpoint.get(params.companyId, query.edition)', assign: 'endpoint' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.endpoint))
  },
  description: 'Gets a company endpoint'
}

exports.list = {
  tags: ['api', 'company-endpoint'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    query: {
      edition: Joi.string().required().description('Event the endpoints are associated to'),
      fields: Joi.string().description('Fields we want to retrieve'),
      sort: Joi.string().description('Sort fields we want to retrieve'),
      skip: Joi.number().description('Number of documents we want to skip'),
      limit: Joi.number().description('Limit of documents we want to retrieve')
    }
  },
  pre: [
    { method: 'endpoint.list(query)', assign: 'endpoints' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.endpoints))
  },
  description: 'Gets all company endpoints'
}

exports.remove = {
  tags: ['api', 'company-endpoint'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Id of the company')
    },
    query: {
      edition: Joi.string().required().description('Event the endpoint is associated to')
    }
  },
  pre: [
    { method: 'endpoint.remove(params.companyId, query.edition)', assign: 'endpoint' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.endpoint))
  },
  description: 'Removes a company endpoint'
}
