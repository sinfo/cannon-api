const Boom = require('@hapi/boom')
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

async function create (authorId, link, author) {
  let _link = {
    author: author,
    company: author === "company" ? authorId : link.companyId,
    edition: link.editionId,
    user: link.userId,
    attendee: author === "attendee" ? authorId : link.attendeeId,
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
      otherObservations: undefined,
      internships: undefined
    }
      : {
        contacts: {
          email: link.notes.contacts !== undefined &&
            link.notes.contacts.email !== undefined
            ? link.notes.contacts.email
            : '',
          phone: link.notes.contacts !== undefined &&
            link.notes.contacts.phone !== undefined
            ? link.notes.contacts.phone
            : ''
        },
        interestedIn: link.notes.interestedIn,
        degree: link.notes.degree,
        availability: link.notes.availability,
        otherObservations: link.notes.otherObservations,
        internships: link.notes.internships
      }
  }



  let newlink = await Link.create(_link).catch((err) => {
    if (err.code === 11000) {
      log.error({ link: _link }, `Link is a duplicate`)
      throw Boom.conflict(`Link is a duplicate`)
    }
    log.error({ err: err, link: _link }, 'error creating link')
    throw Boom.boomify(err)
  })

  return newlink

}

async function update (filter, editionId, link, author) {
  // log.debug({ filter: filter, edition: editionId, link: link }, 'updating link')

  filter = {
    company: filter.companyId,
    edition: editionId,
    attendee: filter.attendeeId,
    author: author
  }

  link.updated = Date.now()

  let _link = await Link.findOneAndUpdate(filter, link, {new: true}).catch((err) =>{
    log.error({ err: err, link: filter }, 'error updating link')
    throw Boom.boomify(err)
  })

  if (!_link) {
    log.error({ err: err, link: filter }, 'error updating link')
    throw Boom.notFound()
  }
  return _link
}

async function get (filter, editionId, author) {
  // log.debug({ filter: filter, edition: editionId }, 'getting link')

  filter = {
    company: filter.companyId,
    edition: editionId,
    attendee: filter.attendeeId,
    author: author
  }

  let link = await Link.findOne(filter).catch((err) =>{
    log.error({ err: err, link: filter }, 'error getting link')
    throw Boom.boomify(err)
  })
  if (!link) {
    log.error({ err: 'not found', link: filter }, 'link not found')
    throw Boom.notFound('link not found')
  }
  return link
}

async function list (filter, query, author) {
  // log.debug({ filter: filter }, 'list link')
  if(!filter){
    filter = {}
  }
  if (typeof filter === 'string') {
    if (author === "company")  filter = { company: filter }
    else filter = { attendee: filter }
  }

  if (query && query.editionId) {
    filter.edition = query.editionId
  }

  filter.author = author

  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  let links = await Link.find(filter, fields, options)
  
  if (author === "company") {
    let achFilter = {
      'validity.to':
        { '$gt': new Date('January 1, 2021 00:00:00').toISOString() },
      'kind': 'cv'
    }
    let achievement = await Achievement.findOne(achFilter).catch((err) =>{
      log.error({ err: err, link: filter }, 'link not found')
      throw Boom.notFound('link not found')
    })

    let objLinks = Array.from(links, (l) => { return l.toObject() })
  
    objLinks.forEach((l) => { l.cv = achievement ? achievement.toObject().users.includes(l.attendee) : false })
    
    return objLinks
  }
  else {
    let objLinks = Array.from(links, (l) => { return l.toObject() })
    return objLinks
  }
}

async function remove (filter, editionId, author) {
  // log.debug({ filter: filter, edition: editionId }, 'removing link')

  filter = {
    company: filter.companyId,
    edition: editionId,
    attendee: filter.attendeeId,
    author: author
  }

  return Link.findOneAndRemove(filter)
}

// Checks if the user is/was part of the company whose link he trying accessing
async function checkCompany (userId, companyId, editionId) {
  let user = await server.methods.user.get({ id: userId })
  if (!user) {
    log.error({ err: 'not found', user: userId }, 'error getting user')
    throw Boom.notFound('user not found')
  }  
  if (!_.findWhere(user.company, { company: companyId, edition: editionId })) {
    log.error({company: companyId, user: userId, edition: editionId, userCompany: user.company}, 'company not found')
    throw Boom.notFound('company not found')
  }
}
