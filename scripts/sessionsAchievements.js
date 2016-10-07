const server = require('../server').hapi
const API = server.methods
const log = require('../server/helpers/logger')
const async = require('async')
const EVENT = '23-sinfo-conf'

API.session.list({event: EVENT}, (err, sessions) => {
  log.debug({err: err, count: sessions.length}, 'got sessions')

  async.each(sessions, (session, cb) => {
    const sessionAchievement = {
      'name': `Went to "${session.name}"`,
      'id': 'session-' + session.id,
      'session': session.id,
      'value': 10,
      'img': `http://static.sinfo.org/SINFO_23/achievements/apresentacoes/session-${session.id}.png`
    }

    // log.debug({sessionAchievement: sessionAchievement}, 'creating achievement');

    API.achievement.create(sessionAchievement, (err, achievement) => {
      if (err) {
        log.warn({err: err, sessionAchievement: sessionAchievement}, 'achievement')
      }

      cb()
    })
  }, (err) => {
    log.info({err: err}, 'achievements created')

    process.exit(0)
  })
})
