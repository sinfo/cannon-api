const Joi = require('joi')
const render = require('../../views/link')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

exports = module.exports

exports.createCompanyLink = {
  options: {
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
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, edition.id)
      let link = await request.server.methods.link.create(request.params.companyId, request.payload, "company", edition.id)
      return h.response(render(link))
    } catch (err) {
      log.error({ err: err }, 'error creating company link')
      return Boom.boomify(err)
    }
  },
}

exports.createAttendeeLink = {
  options: {
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
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      await request.server.methods.link.checkCompany(request.payload.userId, request.payload.companyId, edition.id)
      let link = await request.server.methods.link.create(request.params.attendeeId, request.payload, "attendee", edition.id)
      return h.response(render(link))
    } catch (err) {
      log.error({ err: err }, 'error creating attendee link')
      return Boom.boomify(err)
    }
  },
}

exports.updateCompanyLink = {
  options: {
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['company', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description(
          'Id of the company we are linking from'),
        attendeeId: Joi.string().required().description('Id of the attendee')
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
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, edition.id)
      let link = await request.server.methods.link.update(request.params, edition.id, request.payload, "company")
      return h.response(render(link))
    } catch (err) {
      log.error({ err: err }, 'error creating company link')
      return Boom.boomify(err)
    }
  },
}

exports.updateAttendeeLink = {
  options: {
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description(
          'Id of the company we are linking to'),
        attendeeId: Joi.string().required().description('Id of the attendee')
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
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      let link = await request.server.methods.link.update(request.params, edition.id, request.payload, "attendee")
      return h.response(render(link))
    } catch (err) {
      log.error({ err: err }, 'error creating attendee link')
      return Boom.boomify(err)
    }
  },
}

exports.getCompanyLink = {
  options: {
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['company', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description(
          'Id of the company we are linking from'),
        attendeeId: Joi.string().required().description('Id of the attendee')
      })
    },
    description: 'Gets a company link'
  },
  handler: async function (request, h) {
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, edition.id)
      let link = await request.server.methods.link.get(request.params, edition.id, 'company')
      return h.response(render(link))
    } catch (err) {
      log.error({ err: err }, 'error getting company link')
      return Boom.boomify(err)
    }
  },
}

exports.getAttendeeLink = {
  options: {
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description(
          'Id of the company we are linking to'),
        attendeeId: Joi.string().required().description('Id of the attendee')
      })
    },
    description: 'Gets an attendee link'
  },
  handler: async function (request, h) {
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      let link = await request.server.methods.link.get(request.params, edition.id, 'attendee')
      return h.response(render(link))
    } catch (err) {
      log.error({ err: err }, 'error getting attendee link')
      return Boom.boomify(err)
    }
  },
}

exports.listCompanyLinks = {
  options: {
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['company', 'team', 'admin'] },
    validate: {
      query: Joi.object({
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
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, edition.id)
      let links = await request.server.methods.link.list(request.params.companyId, request.query, 'company', edition.id)
      return h.response(render(links))
    } catch (err) {
      log.error({ err: err }, 'error listing company links')
      return Boom.boomify(err)
    }
  },
}

exports.listAttendeeLinks = {
  options: {
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
    validate: {
      query: Joi.object({
        fields: Joi.string().description('Fields we want to retrieve'),
        sort: Joi.string().description('Sort fields we want to retrieve'),
        skip: Joi.number().description('Number of documents we want to skip'),
        limit: Joi.number().description('Limit of documents we want to retrieve')
      }),
      params: Joi.object({
        attendeeId: Joi.string().required().description('Id of the attendee')
      })
    },
    description: 'Gets all the links of the attendee'
  },
  handler: async function (request, h) {
    try {
      let user = await request.server.methods.user.get(request.auth.credentials.user.id)
      if (!user) {
        log.error('user not found')
        throw Boom.notFound()
      }
      const edition = await request.server.methods.deck.getLatestEdition()
      let links = await request.server.methods.link.list(request.params.attendeeId, request.query, 'attendee', edition.id)
      let sharedLinks
      user.linkShared.forEach((el) => {
        if (el.edition === edition.id) {
          sharedLinks = el.links
        }
      })
      if (sharedLinks) {
        for (let i = 0; i < sharedLinks.length; i++) {
          let newLinks = await request.server.methods.link.list(sharedLinks[i], request.query, "attendee", edition.id)
          links = links.concat(newLinks)
        }
      }
      return h.response(render(links))
    } catch (err) {
      log.error({ err: err }, 'error listing attendee links')
      return Boom.boomify(err)
    }
  },
}

exports.shareUserLinks = { //Share user links
  options: {
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
    try {
      let user = await request.server.methods.user.get(request.params.attendeeId)
      if (!user) {
        log.error('user not found')
        throw Boom.notFound()
      } else if (!user.shareLinks) {
        log.error('Link sharing is not alowed')
        throw Boom.notFound()
      }
      const edition = await request.server.methods.deck.getLatestEdition()
      let me = await request.server.methods.user.linkUsers(request.auth.credentials.user.id, request.params.attendeeId, edition.id)
      return h.response(render(me))
    } catch (err) {
      log.error({ err: err }, 'error sharing attendee links')
    }
  }
}

exports.toggleSharePermission = { //Change slink share permissions
  options: {
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
    description: 'Shares the read user links with the reader'
  },
  handler: async function (request, h) {
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      let me = await request.server.methods.user.setSharePermissions(request.auth.credentials.user.id, edition)
      return h.response(render(me))
    } catch (err) {
      log.error({ err: err }, 'error changing sharing permissions')
    }
  }
}

exports.removeCompanyLink = {
  options: {
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['company', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description(
          'Id of the company we are removing the link from'),
        attendeeId: Joi.string().required().description('Id of the attendee')
      })
    },
    description: 'Removes a company link'
  },
  handler: async function (request, h) {
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, edition.id)
      let link = await request.server.methods.link.remove(request.params, edition.id, 'company')
      if (!link) {
        log.error({ err: 'not found' }, 'error deleting company link')
        return Boom.notFound('link not found')
      }
      return h.response(render(link))
    } catch (err) {
      log.error({ err: err }, 'error deleting company link')
      return Boom.boomify(err)
    }
  },
}


exports.removeAttendeeLink = {
  options: {
    tags: ['api', 'link'],
    auth: { strategies: ['default'], scope: ['user', 'team', 'admin'] },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description('Id of the company'),
        attendeeId: Joi.string().required().description('Id of the attendee we are removing the link from')
      })
    },
    description: 'Removes a link'
  },
  handler: async function (request, h) {
    try {
      const edition = await request.server.methods.deck.getLatestEdition()
      let link = await request.server.methods.link.remove(request.params, edition.id, "attendee")
      if (!link) {
        log.error({ err: 'not found', link: edition.id }, 'error deleting attendee link')
        return Boom.notFound('link not found')
      }
      return h.response(render(link))
    } catch (err) {
      log.error({ err: err }, 'error deleting attendee link')
    }
  }
}
