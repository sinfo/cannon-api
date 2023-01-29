const Joi = require('joi')
const render = require('../../views/link')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

exports = module.exports

exports.create = {
  options:{
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['company', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description(
          'Id of the company we are linking from')
      }),
      payload: Joi.object({
        userId: Joi.string().required().description('Id of the user working for the company'),
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
    description: 'Creates a new link'
  },
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.payload.editionId)
      let link = await request.server.methods.link.create(request.params.companyId, request.payload)
      return h.response(render(link)).created(`/company/${request.params.companyId}/link/${link.attendeeId}`)
    }catch(err){
      log.error({err: err}, 'error creating link')
      return Boom.boomify(err)
    }
  },
}

exports.update = {
  options:{
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
    description: 'Updates a link'
  },
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.query.editionId)
      let link = await request.server.methods.link.update(request.params, request.query.editionId, request.payload)
      return h.response(render(link))
    }catch(err){
      log.error({err: err}, 'error creating link')
      return Boom.boomify(err)
    }
  },
}

exports.get = {
  options:{
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
    description: 'Gets a link'
  },
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.query.editionId)
      let link = await request.server.methods.link.get(request.params, request.query.editionId)
      return h.response(render(link))
    }catch(err){
      log.error({err: err}, 'error creating link')
      return Boom.boomify(err)
    }
  },
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
      log.error({ err: err }, 'error ')
      return Boom.boomify(err)
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
      return h.response(render(link))
    }catch(err){
      log.error({ err: err, link: editionId }, 'error deleting link')
      return Boom.boomify(err)
    }
  },
}
