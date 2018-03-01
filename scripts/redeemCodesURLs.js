const server = require('../server').hapi
const API = server.methods
const log = require('../server/helpers/logger')
const async = require('async')
const config = require('../config')
const EVENT = '23-sinfo-conf'

const authStr = `${config.auth.internal.username}:${config.auth.internal.password}@`

const cannonUrl = `http://${authStr}cannon.sinfo.org`

function getUrl (id, quantity) {
  return `${cannonUrl}/templates/achievements/${id}?quantity=${quantity}`
}

const redeemGrids = []

function processSession (session, cb) {
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

  const achievementId = 'session-' + session.id
  const url = getUrl(achievementId, quantity)

  redeemGrids.push(url)

  cb()
}

API.session.list({event: EVENT}, (err, sessions) => {
  log.debug({err: err, count: sessions.length}, 'got sessions')

  async.eachLimit(sessions, 2, (session, cb) => {
    processSession(session, (err) => {
      if (err) {
        log.warn({err: err, session: session}, 'render')
      }

      // log.debug({session: session}, 'rendered');

      cb()
    })
  }, (err) => {
    if (err) throw err
    // log.info({err: err}, 'redeem codes created');

    process.exit(0)
  })
})
