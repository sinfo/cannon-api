const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const fieldsParser = require('../helpers/fieldsParser')
const Link = require('../db/link')
const _ = require('underscore')
const Achievement = require('../db/achievement')

server.method('link.create', create, {})
server.method('link.update', update, {})
server.method('link.get', get, {})
server.method('link.list', list, {})
server.method('link.remove', remove, {})
server.method('link.checkCompany', checkCompany, {})

async function create (companyId, link) {
  let _link = {
    company: companyId,
    edition: link.editionId,
    user: link.userId,
    attendee: link.attendeeId,
    updated: Date.now(),
    created: Date.now(),
    notes: link.notes === undefined ? {
      contacts: {
        email: '',
        phone: ''
      },
      interestedIn: undefined,
      degree: undefined,
      availability: undefined,
      otherObservations: undefined
    }
      : {
        contacts: {
          email: link.notes.contacts !== undefined &&
            link.notes.contacts.email !== undefined
            ? link.notes.contacts.email
            : '',
          phone: link.notes.contacts !== undefined &&
            link.notes.contacts.email !== undefined
            ? link.notes.contacts.phone
            : ''
        },
        interestedIn: link.notes.interestedIn,
        degree: link.notes.degree,
        availability: link.notes.availability,
        otherObservations: link.notes.otherObservations
      }
  }

  try {

    let newlink = await Link.create(_link)
      if (err) {
     }

    return newLink
  } catch(err){
    if (err.code === 11000) {
      log.error({ link: _link }, `Link is a duplicate`)
      return Boom.conflict(`Link is a duplicate`)
    }
    log.error({ err: err, link: _link }, 'error creating link')
    return Boom.internal()
  }
}

async function update (filter, editionId, link) {
  log.debug({ filter: filter, edition: editionId, link: link }, 'updating link')

  filter = {
    company: filter.companyId,
    edition: editionId,
    attendee: filter.attendeeId
  }

  link.updated = Date.now()

  try {
    let _link = await Link.findOneAndUpdate(filter, link)
    if (!_link) {
      log.error({ err: err, link: filter }, 'error updating link')
      return Boom.notFound()
    }
    return _link
  }
  catch (err) {
    log.error({ err: err, link: filter }, 'error updating link')
    return Boom.internal()
  }
}

async function get (filter, editionId) {
  log.debug({ filter: filter, edition: editionId }, 'getting link')

  filter = {
    company: filter.companyId,
    edition: editionId,
    attendee: filter.attendeeId
  }

  try{
    let link = await Link.findOne(filter)
    if (!link) {
      log.error({ err: 'not found', link: filter }, 'link not found')
      return Boom.notFound('link not found')
    }
    return link
  } catch (err) {
    log.error({ err: err, link: filter }, 'error getting link')
    return Boom.internal('error getting link')
  }

}

async function list (filter, query) {
  // log.debug({ filter: filter }, 'list link')

  if (typeof filter === 'string') {
    filter = { company: filter }
  }

  if (query && query.editionId) {
    filter.edition = query.editionId
  }

  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  let links = await Link.find(filter, fields, options)
    let achFilter = {
      'validity.to':
        { '$gt': new Date('January 1, 2021 00:00:00').toISOString() },
      'kind': 'cv'
    }


   let achievement = await Achievement.findOne(achFilter)
   if(!achievement){
     return Boom.notFound()
   }
   let objLinks = Array.from(links, (l) => { return l.toObject() })
 
   objLinks.forEach((l) => { l.cv = achievement ? achievement.toObject().users.includes(l.attendee) : false })
 
   return objLinks
}

async function remove (filter, editionId) {
  log.debug({ filter: filter, edition: editionId }, 'removing link')

  filter = {
    company: filter.companyId,
    edition: editionId,
    attendee: filter.attendeeId
  }

  return Link.findOneAndRemove(filter)
}

// Checks if the user is/was part of the company whose link he trying accessing
async function checkCompany (userId, companyId, editionId) {
  let user = await server.methods.user.get({ id: userId })
  if (!user) {
    log.error({ err: 'not found', user: userId }, 'error getting user')
    return Boom.notFound('user not found')
  }  
  if (!_.findWhere(user.company, { company: companyId, edition: editionId })) {
    log.error({company: companyId, user: userId, edition: editionId, userCompany: user.company}, 'company not found')
    return Boom.notFound('company not found')
  }
}
