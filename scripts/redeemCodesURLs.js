var server = require('../server').hapi
var API = server.methods
var log = require('../server/helpers/logger')
var async = require('async')
var config = require('../config')
var EVENT = '23-sinfo-conf'

var authStr = config.auth.internal.username + ':' + config.auth.internal.password + '@'

var cannonUrl = 'http://' + authStr + 'cannon.sinfo.org'

function getUrl (id, quantity) {
  return cannonUrl + '/templates/achievements/' + id + '?quantity=' + quantity
}

var redeemGrids = []

function processSession (session, cb) {
  var quantity = 0
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

  var achievementId = 'session-' + session.id
  var url = getUrl(achievementId, quantity)

  redeemGrids.push(url)

  cb()
}

API.session.list({event: EVENT}, function (err, sessions) {
  log.debug({err: err, count: sessions.length}, 'got sessions')

  async.eachLimit(sessions, 2, function (session, cb) {
    processSession(session, function (err) {
      if (err) {
        log.warn({err: err, session: session}, 'render')
      }

      // log.debug({session: session}, 'rendered');

      cb()
    })
  }, function (err) {
    if (err) throw err
    // log.info({err: err}, 'redeem codes created');

    console.log(redeemGrids)

    process.exit(0)
  })
})
