const Joi = require('joi')
const render = require('../../views/link')

exports = module.exports

exports.create = {
  tags: ['api', 'link'],
  auth: {
    strategies: ['default'],
    scope: ['company', 'team', 'admin']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Id of the company we are linking from')
    },
    payload: {
      userId: Joi.string().required().description('Id of the user working for the company'),
      attendeeId: Joi.string().required().description('Id of the attendee'),
      editionId: Joi.string().required().description('Id of the edition'),
      note: Joi.string().default('').description('Notes the user wants to keep on the attendee')
    }
  },
  pre: [
    { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, payload.editionId)', assign: 'verification' },
    { method: 'link.create(params.companyId, payload)', assign: 'link' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.link)).created(`/company/${request.params.companyId}/link/${request.pre.link.attendeeId}`)
  },
  description: 'Creates a new link'
}

exports.update = {
  tags: ['api', 'link'],
  auth: {
    strategies: ['default'],
    scope: ['company', 'team', 'admin']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Id of the company we are linking from'),
      attendeeId: Joi.string().required().description('Id of the attendee')
    },
    query: {
      editionId: Joi.string().required().description('Id of the edition')
    },
    payload: {
      userId: Joi.string().description('Id of the user working for the company'),
      note: Joi.string().description('Notes the user wants to keep on the attendee')
    }
  },
  pre: [
    { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, query.editionId)', assign: 'verification' },
    { method: 'link.update(params, query.editionId, payload)', assign: 'link' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.link))
  },
  description: 'Updates a link'
}

exports.get = {
  tags: ['api', 'link'],
  auth: {
    strategies: ['default'],
    scope: ['company', 'team', 'admin']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Id of the company we are linking from'),
      attendeeId: Joi.string().required().description('Id of the attendee')
    },
    query: {
      editionId: Joi.string().required().description('Id of the edition')
    }
  },
  pre: [
    { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, query.editionId)', assign: 'verification' },
    { method: 'link.get(params, query.editionId)', assign: 'link' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.link))
  },
  description: 'Gets a link'
}

exports.list = {
  tags: ['api', 'link'],
  auth: {
    strategies: ['default'],
    scope: ['company', 'team', 'admin']
  },
  validate: {
    query: {
      editionId: Joi.string().required().description('Id of the edition'),
      fields: Joi.string().description('Fields we want to retrieve'),
      sort: Joi.string().description('Sort fields we want to retrieve'),
      skip: Joi.number().description('Number of documents we want to skip'),
      limit: Joi.number().description('Limit of documents we want to retrieve')
    },
    params: {
      companyId: Joi.string().required().description('Id of the company we are removing the link from')
    }
  },
  pre: [
    { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, query.editionId)', assign: 'verification' },
    { method: 'link.list(params.companyId, query)', assign: 'links' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.links))
  },
  description: 'Gets all the links of the company'
}

exports.remove = {
  tags: ['api', 'link'],
  auth: {
    strategies: ['default'],
    scope: ['company', 'team', 'admin']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Id of the company we are removing the link from'),
      attendeeId: Joi.string().required().description('Id of the attendee')
    },
    query: {
      editionId: Joi.string().required().description('Id of the edition')
    }
  },
  pre: [
    { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, query.editionId)', assign: 'verification' },
    { method: 'link.remove(params, query.editionId)', assign: 'link' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.link))
  },
  description: 'Removes a link'
}
