const Boom = require('@hapi/boom')
const log = require('../helpers/logger')
const server = require('../').hapi
const Url = require('../db/url')

server.method('url.get', get, {})

async function get(companyId, editionId) {
  const filterAll = {
    edition: editionId,
    kind: 'all'
  }
  const filterCompanyConnections = {
    company: companyId,
    edition: editionId,
    kind: 'company'
  }

  const all = await Url.findOne(filterAll)
  if (!all) {
    log.error({ err: 'not found all', edition: editionId }, 'error getting download url')
    throw Boom.notFound('url not found')
  }
  const companyConnections = await Url.findOne(filterCompanyConnections)

  return { all: all ? all.url : undefined, companyConnections: companyConnections ? companyConnections.url : undefined }
}
