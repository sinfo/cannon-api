const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const fieldsParser = require('../helpers/fieldsParser')
const Endpoint = require('../db/endpoint')

server.method('endpoint.create', create, {})
server.method('endpoint.update', update, {})
server.method('endpoint.get', get, {})
server.method('endpoint.list', list, {})
server.method('endpoint.remove', remove, {})
server.method('endpoint.isValid', isValid, {})
server.method('endpoint.incrementVisited', incrementVisited, {})

function create (endpoint, cb) {
  // generates an enpoint item for every company in endpoin.companies
  // `endpoint` is passed as `this` to the map function
  const endpoints = Array.from(endpoint.companies, (company) => {
    return {
      company: company,
      edition: endpoint.edition,
      visited: 0,
      validaty: {
        from: endpoint.validaty.from,
        to: endpoint.validaty.to
      },
      created: new Date(),
      updated: new Date()
    }
  })

  Endpoint.collection.insert(endpoints, (err, list) => {
    if (err) {
      if (err.code === 11000) {
        return cb(Boom.conflict(`endpoint <${endpoint.company}, ${endpoint.edition}> is a duplicate`))
      }

      log.error({ err: err, endpoint: endpoint }, 'error creating endpoint')
      return cb(Boom.internal())
    }

    cb(null, list)
  })
}

function update (companyId, editionId, endpoint, cb) {
  const filter = {
    company: companyId,
    edition: editionId
  }

  endpoint.updated = new Date()

  Endpoint.findOneAndUpdate(filter, endpoint, (err, _endpoint) => {
    if (err) {
      log.error({ err: err, company: companyId, edition: editionId }, 'error updating endpoint')
      return cb(Boom.internal())
    }
    if (!_endpoint) {
      log.error({ err: 'Not Found', company: companyId, edition: editionId }, 'error updating endpoint')
      return cb(Boom.notFound())
    }

    cb(null, _endpoint.toObject({ getters: true }))
  })
}

function get (companyId, editionId, cb) {
  const filter = {
    company: companyId,
    edition: editionId
  }

  Endpoint.findOne(filter, (err, endpoint) => {
    if (err) {
      log.error({ err: err, company: companyId, edition: editionId }, 'error getting endpoint')
      return cb(Boom.internal('error getting endpoint'))
    }
    if (!endpoint) {
      log.error({ err: 'not found', company: companyId, edition: editionId }, 'error getting endpoint')
      return cb(Boom.notFound('endpoint not found'))
    }

    cb(null, endpoint.toObject({ getters: true }))
  })
}

function list (query, cb) {
  cb = cb || query // fields is optional

  const filter = { edition: query.edition }
  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  Endpoint.find(filter, fields, options, (err, endpoints) => {
    if (err) {
      log.error({ err: err, edition: query.edition }, 'error getting all endpoints')
      return cb(Boom.internal())
    }

    cb(null, endpoints)
  })
}

function remove (companyId, editionId, cb) {
  Endpoint.findOneAndRemove({ company: companyId, edition: editionId }, (err, endpoint) => {
    if (err) {
      log.error({ err: err, company: companyId, edition: editionId }, 'error deleting endpoint')
      return cb(Boom.internal())
    }
    if (!endpoint) {
      log.error({ err: 'not found', company: companyId, edition: editionId }, 'error deleting endpoint')
      return cb(Boom.notFound('Endpoint not found'))
    }

    return cb(null, endpoint)
  })
}

function isValid (companyId, editionId, cb) {
  const filter = {
    company: companyId,
    edition: editionId
  }

  Endpoint.findOne(filter, (err, endpoint) => {
    if (err) {
      log.error({ err: err, company: companyId, edition: editionId }, 'error validating endpoint')
      return cb(Boom.internal('error getting endpoint'))
    }
    if (!endpoint) {
      log.error({ err: 'not found', company: companyId, edition: editionId }, 'error validating endpoint')
      return cb(Boom.notFound('endpoint not found'))
    }

    let now = new Date()
    if (now > new Date(endpoint.validaty.from) && now < new Date(endpoint.validaty.to)) {
      return cb(null, true)
    }

    log.error('isvalid')
    return cb(Boom.notFound('isValid'))
  })
}

function incrementVisited (companyId, editionId, cb) {
  const filter = {
    company: companyId,
    edition: editionId
  }

  const update = {
    $inc: { 'visited': 1 }
  }

  Endpoint.findOneAndUpdate(filter, update, (err, endpoint) => {
    if (err) {
      log.error({ err: err, company: companyId, edition: editionId }, 'error incrementing endpoint visited')
      return cb(Boom.internal('error getting endpoint'))
    }
    if (!endpoint) {
      log.error({ err: 'not found', company: companyId, edition: editionId }, 'error incrementing endpoint visited')
      return cb(Boom.notFound('endpoint not found'))
    }

    return cb(null, endpoint)
  })
}
