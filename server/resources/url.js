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
  const companyConnections = await Url.findOne(filterCompanyConnections)

  if (!all && !companyConnections) {
    log.error({
      err: 'not found any urls',
      companyId,
      editionId
    }, 'Error getting download url: no urls found')
    // throw Boom.notFound('u1rl not found')
    return { all: undefined, companyConnections: undefined }
  }

  log.info({
    companyId,
    editionId,
    allUrl: all ? all.url : undefined,
    companyConnectionsUrl: companyConnections ? companyConnections.url : undefined
  }, 'Fetched download urls')
  return { all: all ? all.url : undefined, companyConnections: companyConnections ? companyConnections.url : undefined }
}
