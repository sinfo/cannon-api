const Joi = require('joi')
const render = require('../../views/link')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

exports = module.exports

exports.createCompanyLink = {
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
            'Degree of the attendee (e.g. Computer Science bachelor\'s)'),
          availability:
            Joi.string().allow('').description('Attendee\'s availability'),
          otherObservations: Joi.string().allow('').description('Other notes')
        })
      })
    },
    description: 'Creates a new company link'
  },
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.payload.editionId)
      let link = await request.server.methods.link.create(request.params.companyId, request.payload, "company")
      return h.response(render(link)).created(`/company/${request.params.companyId}/link/${link.attendeeId}`)
    }catch(err){
      log.error({err: err}, 'error creating company link')
      return Boom.boomify(err)
    }
  },
}

exports.createAttendeeLink = {
  options:{
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        attendeeId: Joi.string().required().description(
          'Id of the user creating the link')
      }),
      payload: Joi.object({
        userId: Joi.string().required().description('Id of the user working for the company'),
        companyId: Joi.string().required().description('Id of the company'),
        editionId: Joi.string().required().description('Id of the edition'),
        notes: Joi.object().keys({
          contacts: Joi.object().keys({
            email: Joi.string().allow('').description('Email of the attendee'),
          }),
          internships: Joi.string().allow('').description('Internship details'),
          otherObservations: Joi.string().allow('').description('Other notes')
        })
      })
    },
    description: 'Creates a new attendee link'
  },
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.payload.userId, request.payload.companyId, request.payload.editionId)
      let link = await request.server.methods.link.create(request.params.attendeeId, request.payload, "attendee")
      return h.response(render(link)).created(`/users/${request.params.attendeeId}/link/${link.companyId}`)
    }catch(err){
      log.error({err: err}, 'error creating attendee link')
      return Boom.boomify(err)
    }
  },
}

exports.updateCompanyLink = {
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
            'Degree of the attendee (e.g. Computer Science bachelor\'s)'),
          availability:
            Joi.string().allow('').description('Attendee\'s availability'),
          otherObservations: Joi.string().allow('').description('Other notes')
        }).allow(null)
      })
    },
    description: 'Updates a company link'
  },
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.query.editionId)
      let link = await request.server.methods.link.update(request.params, request.query.editionId, request.payload, "company")
      return h.response(render(link))
    }catch(err){
      log.error({err: err}, 'error creating company link')
      return Boom.boomify(err)
    }
  },
}

exports.updateAttendeeLink = {
  options:{
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description(
          'Id of the company we are linking to'),
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
          }),
          internships: Joi.string().allow('').description('Internship details'),
          otherObservations: Joi.string().allow('').description('Other notes')
        }).allow(null)
      })
    },
    description: 'Updates an attendee link'
  },
  handler: async function (request, h) {
    try{
      let link = await request.server.methods.link.update(request.params, request.query.editionId, request.payload, "attendee")
      return h.response(render(link))
    }catch(err){
      log.error({err: err}, 'error creating attendee link')
      return Boom.boomify(err)
    }
  },
}

exports.getCompanyLink = {
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
    description: 'Gets a company link'
  },
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.query.editionId)
      let link = await request.server.methods.link.get(request.params, request.query.editionId, "company")
      return h.response(render(link))
    }catch(err){
      log.error({err: err}, 'error getting company link')
      return Boom.boomify(err)
    }
  },
}

exports.getAttendeeLink = {
  options:{
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description(
          'Id of the company we are linking to'),
        attendeeId: Joi.string().required().description('Id of the attendee')
      }),
      query: Joi.object({
        editionId: Joi.string().required().description('Id of the edition')
      })
    },
    description: 'Gets an attendee link'
  },
  handler: async function (request, h) {
    try{
      let link = await request.server.methods.link.get(request.params, request.query.editionId, 'attendee')
      return h.response(render(link))
    }catch(err){
      log.error({err: err}, 'error getting attendee link')
      return Boom.boomify(err)
    }
  },
}

exports.listCompanyLinks = {
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
      let links = await request.server.methods.link.list(request.params.companyId, request.query, "company")
      return h.response(render(links))
    }catch(err){
      log.error({ err: err }, 'error listing company links')
      return Boom.boomify(err)
    }
  },
}

exports.listAttendeeLinks = {
  options:{
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
    validate: {
      query: Joi.object({
        editionId: Joi.string().required().description('Id of the edition'),
        fields: Joi.string().description('Fields we want to retrieve'),
        sort: Joi.string().description('Sort fields we want to retrieve'),
        skip: Joi.number().description('Number of documents we want to skip'),
        limit: Joi.number().description('Limit of documents we want to retrieve')
      })
    },
    description: 'Gets all the links of the attendee'
  },
  handler: async function (request, h) {
    try{
      let user = await request.server.methods.user.get(request.auth.credentials.user.id)
      if (!user) {
        log.error('user not found')
        throw Boom.notFound()
      }      
      let links = await request.server.methods.link.list(request.auth.credentials.user.id, request.query, "attendee")
      let sharedLinks = user.linkShared
      for(let i = 0; i < sharedLinks.length; i++){
        let newLinks = await request.server.methods.link.list(sharedLinks[i], request.query, "attendee")
        links = links.concat(newLinks)
      }
      return h.response(render(links))
    }catch(err){
      log.error({ err: err }, 'error listing attendee links')
      return Boom.boomify(err)
    }
  },
}

exports.shareUserLinks = { //Share user links
  options:{
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        attendeeId: Joi.string().required().description('Id of the sharer')
      })
    },
    description: 'Shares the read user links with the reader'
  },
  handler: async function (request, h) {
    try{
      console.log("Passou 2")
      let user = await request.server.methods.user.get(request.params.attendeeId)
      console.log("Passou 3")
      if (!user) {
        console.log("Erro 1")
        log.error('user not found')
        throw Boom.notFound()
      } else if (!user.shareLinks) {
        console.log("Erro 2")
        log.error('Link sharing is not alowed')
        throw Boom.notFound()
      }
      console.log("Passou 4")
      let me = await request.server.methods.user.linkUsers(request.auth.credentials.user.id, request.params.attendeeId)
      console.log("Passou 5")
      return h.response(render(me))
    }catch(err){
      log.error({ err: err }, 'error sharing attendee links')
      return Boom.boomify(err)
    }
  },
}

exports.removeCompanyLink = {
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
  description: 'Removes a company link'
},
  handler: async function (request, h) {
    try{
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.query.editionId)
      let link = await request.server.methods.link.remove(request.params, request.query.editionId, "company")
      if (!link) {
        log.error({ err: 'not found', link: editionId }, 'error deleting company link')
        return Boom.notFound('link not found')
      }
      return h.response(render(link))
    }catch(err){
      log.error({ err: err, link: editionId }, 'error deleting company link')
      return Boom.boomify(err)
    }
  },
}

exports.removeAttendeeLink = {
  options:{
  tags: ['api', 'link'],
  auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
  validate: {
    params: Joi.object({
      companyId: Joi.string().required().description('Id of the company'),
      attendeeId: Joi.string().required().description('Id of the attendee we are removing the link from')
    }),
    query: Joi.object({
      editionId: Joi.string().required().description('Id of the edition')
    })
  },
  description: 'Removes a link'
},
  handler: async function (request, h) {
    try{
      let link = await request.server.methods.link.remove(request.params, request.query.editionId, "attendee")
      if (!link) {
        log.error({ err: 'not found', link: editionId }, 'error deleting attendee link')
        return Boom.notFound('link not found')
      }
      return h.response(render(link))
    }catch(err){
      log.error({ err: err, link: editionId }, 'error deleting attendee link')
      return Boom.boomify(err)
    }
  },
}
