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

async function create(endpoint) {
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
  let list = await Endpoint.create(endpoints).catch((err) =>{
    if (err.code === 11000) {
      throw Boom.conflict(`endpoint <${endpoint.company}, ${endpoint.edition}> is a duplicate`)
    }

    log.error({ err: err, endpoint: endpoint }, 'error creating endpoint')
    throw Boom.boomify(err)
  })
  return list
}

async function update(companyId, query, endpoint) {
  const filter = {
    company: companyId,
    edition: query? query.edition : null
  }

  endpoint.updated = new Date()

  let _endpoint = await Endpoint.findOneAndUpdate(filter, endpoint, {new: true}).catch((err) =>{
    log.error({ err: err, company: companyId }, 'error updating endpoint')
    throw Boom.internal()
  })
  if (!_endpoint) {
    log.error({ err: 'Not Found', company: companyId }, 'error updating endpoint')
    throw Boom.notFound()
  }
  return _endpoint

}

async function get(companyId, query) {
  const filter = {
    company: companyId,
    edition: query? query.edition : null
  }

  log.error({n:"2", company: companyId, query: query})

  let endpoint = await Endpoint.findOne(filter)
  log.error({n:"1", end: endpoint})
  if (!endpoint) {
    log.error({ err: 'not found', company: companyId, edition: editionId }, 'error getting endpoint')
    throw Boom.notFound('endpoint not found')
  }

  return endpoint.toObject({ getters: true })
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
    throw Boom.internal()
  }
}

async function remove(companyId, editionId) {
  try {
    let endpoint = await Endpoint.findOneAndRemove({ company: companyId, edition: editionId })
    if (!endpoint) {
      log.error({ err: 'not found', company: companyId, edition: editionId }, 'error deleting endpoint')
      throw Boom.notFound('Endpoint not found')
    }
    return endpoint
  } catch (err) {
    log.error({ err: err, company: companyId, edition: editionId }, 'error deleting endpoint')
    throw Boom.internal()
  }
}

async function isValid(companyId, editionId) {
  const filter = {
    company: companyId,
    edition: editionId
  }


  let endpoint = await Endpoint.findOne(filter)
  if (!endpoint) {
    log.error({ err: 'not found', company: companyId, edition: editionId }, 'error validating endpoint')
    throw Boom.notFound('Endpoint not created yet.')
  }

  let now = new Date()
  if (now > new Date(endpoint.validity.from) && now < new Date(endpoint.validity.to)) {
    return true
  }

  log.error('isvalid')
  throw Boom.notFound('isValid')
  
}

async function incrementVisited(companyId, editionId) {
  const filter = {
    company: companyId,
    edition: editionId
  }

  const update = {
    $inc: { 'visited': 1 }
  }

  let endpoint = await Endpoint.findOneAndUpdate(filter, update)
  if (!endpoint) {
    log.error({ err: 'not found', company: companyId, edition: editionId }, 'error incrementing endpoint visited')
    throw Boom.notFound('endpoint not found')
  }
  return endpoint

}
