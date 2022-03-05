const Joi = require('joi')
const render = require('../../views/link')

exports = module.exports

exports.create = {
  tags: ['api', 'link'],
  auth: { strategies: ['default'], scope: ['company', 'team', 'admin'] },
  validate: {
    params: Joi.object({
      companyId: Joi.string().required().description(
        'Id of the company we are linking from')
    }),
    payload: Joi.object({
      userId: Joi.string().required().description(
        'Id of the user working for the company'),
      attendeeId: Joi.string().required().description('Id of the attendee'),
      editionId: Joi.string().required().description('Id of the edition'),
      notes: Joi.object().keys({
        contacts: Joi.object().keys({
          email: Joi.string().allow('').description('Email of the attendee'),
          phone:
            Joi.string().allow('').description('Phone number of the attendee')
        }),
        interestedIn: Joi.string().allow('').description(
          'Interests of the attendee relevant to the company'),
        degree: Joi.string().allow('').description(
          'Degree of the attendee (e.g. Computer Science batchelor\'s)'),
        availability:
          Joi.string().allow('').description('Attendee\'s availability'),
        otherObservations: Joi.string().allow('').description('Other notes')
      })
    })
  },
  pre: [
    {
      method:
        'link.checkCompany(auth.credentials.user.id, params.companyId, payload.editionId)',
      assign: 'verification'
    },
    { method: 'link.create(params.companyId, payload)', assign: 'link' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.link))
      .created(`/company/${request.params.companyId}/link/${request.pre.link.attendeeId}`)
  },
  description: 'Creates a new link'
}

exports.update = {
  options: {
  tags: ['api', 'link'],
  auth: { strategies: ['default'], scope: ['company', 'team', 'admin'] },
  validate: {
    params: Joi.object({
      companyId: Joi.string().required().description(
        'Id of the company we are linking from'),
      attendeeId: Joi.string().required().description('Id of the attendee')
    }),
    query: Joi.object({ 
      editionId: Joi.string().required().description('Id of the edition') 
    }),
    payload: Joi.object({
      userId:
        Joi.string().description('Id of the user working for the company'),
      notes: Joi.object().keys({
        contacts: Joi.object().keys({
          email: Joi.string().description('Email of the attendee').allow(''),
          phone: Joi.string().description('Phone number of the attendee').allow('')
        }),
        interestedIn: Joi.string().allow('').description(
          'Interests of the attendee relevant to the company'),
        degree: Joi.string().allow('').description(
          'Degree of the attendee (e.g. Computer Science batchelor\'s)'),
        availability:
          Joi.string().allow('').description('Attendee\'s availability'),
        otherObservations: Joi.string().allow('').description('Other notes')
      }).allow(null)
    })
  },
  pre: [
    {
      method:
        'link.checkCompany(auth.credentials.user.id, params.companyId, query.editionId)',
      assign: 'verification'
    },
    { method: 'link.update(params, query.editionId, payload)', assign: 'link' }
  ],
  description: 'Updates a link'
},
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.query.editionId)
      let link = await request.server.methods.link.update(request.params, request.query.editionId, request.payload)
      if (!_link) {
        log.error({ err: err }, 'error updating link')
        return Boom.notFound()
      }
      return h.response(render(link))
    }catch(err){
      log.error({ err: err }, 'error updating link')
      return Boom.internal()
    }
  },
}

exports.get = {
  tags: ['api', 'link'],
  auth: { strategies: ['default'], scope: ['company', 'team', 'admin'] },
  validate: {
    params: Joi.object({
      companyId: Joi.string().required().description(
        'Id of the company we are linking from'),
      attendeeId: Joi.string().required().description('Id of the attendee')
    }),
    query: Joi.object({
      editionId: Joi.string().required().description('Id of the edition') 
    })
  },
  pre: [
    {
      method:
        'link.checkCompany(auth.credentials.user.id, params.companyId, query.editionId)',
      assign: 'verification'
    },
    { method: 'link.get(params, query.editionId)', assign: 'link' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.link))
  },
  description: 'Gets a link'
}

exports.list = {
  options:{
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['company', 'team', 'admin'] },
    validate: {
      query: Joi.object({
        editionId: Joi.string().required().description('Id of the edition'),
        fields: Joi.string().description('Fields we want to retrieve'),
        sort: Joi.string().description('Sort fields we want to retrieve'),
        skip: Joi.number().description('Number of documents we want to skip'),
        limit: Joi.number().description('Limit of documents we want to retrieve')
      }),
      params: Joi.object({
        companyId: Joi.string().required().description(
          'Id of the company we are removing the link from')
      })
    },
    description: 'Gets all the links of the company'
  },
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.query.editionId)
      let links = await request.server.methods.link.list(request.params.companyId, request.query)
      return h.response(render(links))
    }catch(err){
      log.error({ err: err, user: userId }, 'error ')
      return Boom.internal()
    }
  },
}

exports.remove = {
  options:{
  tags: ['api', 'link'],
  auth: { strategies: ['default'], scope: ['company', 'team', 'admin'] },
  validate: {
    params: Joi.object({
      companyId: Joi.string().required().description(
        'Id of the company we are removing the link from'),
      attendeeId: Joi.string().required().description('Id of the attendee')
    }),
    query: Joi.object({
      editionId: Joi.string().required().description('Id of the edition')
    })
  },
  description: 'Removes a link'
},
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.query.editionId)
      let link = await request.server.methods.link.remove(request.params, request.query.editionId)
      if (!link) {
        log.error({ err: 'not found', link: editionId }, 'error deleting link')
        return Boom.notFound('link not found')
      }
      //reply(render(request.pre.link))
      return h.response(render(link))
    }catch(err){
      log.error({ err: err, link: editionId }, 'error deleting link')
      return Boom.internal()
    }
  },
}
