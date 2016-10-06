const server = require('../server').hapi
const API = server.methods
const log = require('../server/helpers/logger')
const async = require('async')
const NodePDF = require('nodepdf')
const config = require('../config')
const join = require('path').join
const EVENT = '23-sinfo-conf'

const options = {
  'paperSize': {
    'pageFormat': 'A4',
    'margin': {
      'top': '2cm'
    },
    'header': {
      'height': '1cm',
      'contents': 'HEADER {currentPage} / {pages}' // If you have 2 pages the result looks like this: HEADER 1 / 2
    },
    'footer': {
      'height': '1cm',
      'contents': 'FOOTER {currentPage} / {pages}'
    }
  }
}

const authStr = `${config.auth.internal.username}:${config.auth.internal.password}@`

const cannonUrl = `http://${authStr}localhost:8090`

function getUrl (id, quantity) {
  return `${cannonUrl}/templates/achievements/${id}?quantity=${quantity}`
}

function renderPDF (session, cb) {
  let quantity = 0
  switch (session.kind.toLowerCase()) {
    case 'presentation':
      quantity = 70
      break
    case 'keynote':
      quantity = 350
      break
    case 'workshop':
      quantity = 40
      break
  }

  const achievementId = `session-${session.id}`
  const url = getUrl(achievementId, quantity)

  const pdfName = join(__dirname, 'output', achievementId + '.pdf')

  log.debug({url: url, pdfName: pdfName}, 'render')

  NodePDF.render(url, pdfName, options, cb)
}

API.session.list({event: EVENT}, (err, sessions) => {
  log.debug({err: err, count: sessions.length}, 'got sessions')

  async.each(sessions, (session, cb) => {
    renderPDF(session, (err, fileName) => {
      if (err) {
        log.warn({err: err, fileName: fileName}, 'render')
      }

      cb()
    })
  }, (err) => {
    log.info({err: err}, 'redeem codes created')

    process.exit(0)
  })
})
