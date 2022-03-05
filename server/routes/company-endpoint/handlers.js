const Joi = require('joi')
const render = require('../../views/endpoint')

exports = module.exports

exports.create = {
  options:{
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
    pre: [
      { method: 'endpoint.create(payload)', assign: 'endpoints' }
    ],
    description: 'Creates a new company endpoint'
  },
  handler: function (request, reply) {
    reply(render(request.pre.endpoints)).created('/company-endpoint') // will reply all, not just the created
  },
}

exports.update = {
  options:{
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
    pre: [
      { method: 'endpoint.update(params.companyId, query.edition, payload)', assign: 'endpoint' }
    ],
    description: 'Updates a company endpoint'
  },
  handler: function (request, reply) {
    reply(render(request.pre.endpoint))
  },
}

exports.get = {
  options:{
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
    pre: [
      { method: 'endpoint.get(params.companyId, query.edition)', assign: 'endpoint' }
    ],
    description: 'Gets a company endpoint'
  },
  handler: function (request, reply) {
    reply(render(request.pre.endpoint))
  },
}

exports.list = {
  options:{
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
    pre: [
      { method: 'endpoint.list(query)', assign: 'endpoints' }
    ],
    description: 'Gets all company endpoints'
  },
  handler: function (request, reply) {
    reply(render(request.pre.endpoints))
  },
}

exports.remove = {
  options:{
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
    pre: [
      { method: 'endpoint.remove(params.companyId, query.edition)', assign: 'endpoint' }
    ],
    description: 'Removes a company endpoint'
  },
  handler: function (request, reply) {
    reply(render(request.pre.endpoint))
  },
}
