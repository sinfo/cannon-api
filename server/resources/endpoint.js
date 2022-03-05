const Boom = require('@hapi/boom')
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

async function create(endpoint, cb) {
  // generates an enpoint item for every company in endpoin.companies
  // `endpoint` is passed as `this` to the map function
  const endpoints = Array.from(endpoint.companies, (company) => {
    return {
      company: company,
      edition: endpoint.edition,
      visited: 0,
      validity: {
        from: endpoint.validity.from,
        to: endpoint.validity.to
      },
      created: new Date(),
      updated: new Date()
    }
  })
  try {
    let list = await Endpoint.collection.insert(endpoints)
    return list
  }
  catch (err) {
    if (err.code === 11000) {
      return Boom.conflict(`endpoint <${endpoint.company}, ${endpoint.edition}> is a duplicate`)
    }

    log.error({ err: err, endpoint: endpoint }, 'error creating endpoint')
    return Boom.internal()
  }

}

async function update(companyId, editionId, endpoint) {
  const filter = {
    company: companyId,
    edition: editionId
  }

  endpoint.updated = new Date()
  try {
    let _endpoint = await Endpoint.findOneAndUpdate(filter, endpoint)
    if (!_endpoint) {
      log.error({ err: 'Not Found', company: companyId, edition: editionId }, 'error updating endpoint')
      return Boom.notFound()
    }
    return _endpoint
  } catch (err) {
    log.error({ err: err, company: companyId, edition: editionId }, 'error updating endpoint')
    return Boom.internal()
  }

}

function get(companyId, editionId, cb) {
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

async function list(query) {

  const filter = { edition: query.edition }
  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  try {
    return await Endpoint.find(filter, fields, options)
  }
  catch (err) {
    log.error({ err: err, edition: query.edition }, 'error getting all endpoints')
    return Boom.internal()
  }
}

async function remove(companyId, editionId) {
  try {
    let endpoint = await Endpoint.findOneAndRemove({ company: companyId, edition: editionId })
    if (!endpoint) {
      log.error({ err: 'not found', company: companyId, edition: editionId }, 'error deleting endpoint')
      return Boom.notFound('Endpoint not found')
    }
    return endpoint
  } catch (err) {
    log.error({ err: err, company: companyId, edition: editionId }, 'error deleting endpoint')
    return Boom.internal()
  }
}

async function isValid(companyId, editionId) {
  const filter = {
    company: companyId,
    edition: editionId
  }

  try {
    let endpoint = await Endpoint.findOne(filter)
    if (!endpoint) {
      log.error({ err: 'not found', company: companyId, edition: editionId }, 'error validating endpoint')
      return Boom.notFound('Endpoint not created yet.')
    }

    let now = new Date()
    if (now > new Date(endpoint.validity.from) && now < new Date(endpoint.validity.to)) {
      return true
    }

    log.error('isvalid')
    return Boom.notFound('isValid')
  }
  catch (err) {
    log.error({ err: err, company: companyId, edition: editionId }, 'error validating endpoint')
    return Boom.internal('error getting endpoint')
  }
}

async function incrementVisited(companyId, editionId) {
  const filter = {
    company: companyId,
    edition: editionId
  }

  const update = {
    $inc: { 'visited': 1 }
  }

  try {
    let endpoint = await Endpoint.findOneAndUpdate(filter, update)
    if (!endpoint) {
      log.error({ err: 'not found', company: companyId, edition: editionId }, 'error incrementing endpoint visited')
      return Boom.notFound('endpoint not found')
    }
    return endpoint
  } catch (err) {
    log.error({ err: err, company: companyId, edition: editionId }, 'error incrementing endpoint visited')
    return cb(Boom.internal('error getting endpoint'))
  }
}
