const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const fieldsParser = require('../helpers/fieldsParser')
const Link = require('../db/link')
const _ = require('underscore')

server.method('link.create', create, {})
server.method('link.update', update, {})
server.method('link.get', get, {})
server.method('link.list', list, {})
server.method('link.remove', remove, {})
server.method('link.checkCompany', checkCompany, {})

function create(companyId, link, cb) {
  _link = {
    company: companyId,
    edition: link.editionId,
    user: link.userId,
    attendee: link.attendeeId,
    updated: Date.now(),
    created: Date.now(),
    notes: {
      contacts: {
        email: link.notes.contacts !== undefined &&
                link.notes.contacts.email !== undefined ?
            link.notes.contacts.email :
            '',
        phone: link.notes.contacts !== undefined &&
                link.notes.contacts.email !== undefined ?
            link.notes.contacts.phone :
            ''
      },
      interestedIn: link.notes.interestedIn,
      degree: link.notes.degree,
      availability: link.notes.availability,
      otherObservations: link.notes.otherObservations
    }
  };

  Link.create(_link, (err, newlink) => {
    if (err) {
      if (err.code === 11000) {
        return cb(Boom.conflict(`Link "${newlink.id}" is a duplicate`))
      }

      log.error({err: err, link: newlink}, 'error creating link')
      return cb(Boom.internal())
    }

    cb(null, newlink.toObject({getters: true}))
  })
}

function update(filter, editionId, link, cb) {
  log.debug({filter: filter, edition: editionId, link: link}, 'updating link')

  filter = {
    company: filter.companyId,
    edition: editionId,
    attendee: filter.attendeeId
  };

  link.updated = Date.now()

  Link.findOneAndUpdate(filter, link, (err, _link) => {
    if (err) {
      log.error({err: err, link: filter}, 'error updating link')
      return cb(Boom.internal())
    }
    if (!_link) {
      log.error({err: err, link: filter}, 'error updating link')
      return cb(Boom.notFound())
    }

    cb(null, _link.toObject({getters: true}))
  })
}

function get(filter, editionId, cb) {
  log.debug({filter: filter, edition: editionId}, 'getting link')

  filter = {
    company: filter.companyId,
    edition: editionId,
    attendee: filter.attendeeId
  };

  Link.findOne(filter, (err, link) => {
    if (err) {
      log.error({err: err, link: filter}, 'error getting link')
      return cb(Boom.internal('error getting link'))
    }
    if (!link) {
      log.error({err: 'not found', link: filter}, 'link not found')
      return cb(Boom.notFound('link not found'))
    }

    cb(null, link.toObject({getters: true}))
  })
}

function list(filter, query, cb) {
  log.debug({filter: filter}, 'list link')

  cb = cb || query  // fields is optional

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
  };

  Link.find(filter, fields, options, (err, links) => {
    if (err) {
      log.error({err: err}, 'error getting all links')
      return cb(Boom.internal())
    }

    cb(null, Array.from(links, (l) => {return l.toObject()}))
  })
}

function remove(filter, editionId, cb) {
  log.debug({filter: filter, edition: editionId}, 'removing link')

  filter = {
    company: filter.companyId,
    edition: editionId,
    attendee: filter.attendeeId
  };

  Link.findOneAndRemove(filter, (err, link) => {
    if (err) {
      log.error({err: err, link: editionId}, 'error deleting link')
      return cb(Boom.internal())
    }
    if (!link) {
      log.error({err: 'not found', link: editionId}, 'error deleting link')
      return cb(Boom.notFound('link not found'))
    }

    return cb(null, link)
  })
}

// Checks if the user is/was part of the company whose link he trying accessing
function checkCompany(userId, companyId, editionId, cb) {
  server.methods.user.get({id: userId}, (err, user) => {
    if (err) {
      log.error({err: err, user: userId}, 'error getting user')
      return cb(Boom.internal())
    }

    if (!user) {
      log.error({err: 'not found', user: userId}, 'error getting user')
      return cb(Boom.notFound('user not found'))
    }

    if (_.findWhere(user.company, {company: companyId, edition: editionId})) {
      return cb(null, true)
    }

    return cb(Boom.notFound())
  })
}
