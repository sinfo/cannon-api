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

  log.info({ companyId, editionId, filterAll, filterCompanyConnections }, 'Attempting to fetch download urls')
  const all = await Url.findOne(filterAll)
  if (!all) {
    log.error({
      err: 'not found all',
      companyId,
      editionId,
      filter: filterAll
    }, 'Error getting download url: no "all" url found')
    throw Boom.notFound('url not found')
  }
  const companyConnections = await Url.findOne(filterCompanyConnections)

  log.info({
    companyId,
    editionId,
    allUrl: all ? all.url : undefined,
    companyConnectionsUrl: companyConnections ? companyConnections.url : undefined
  }, 'Fetched download urls')
  return { all: all ? all.url : undefined, companyConnections: companyConnections ? companyConnections.url : undefined }
}
