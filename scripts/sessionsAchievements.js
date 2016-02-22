var server = require('server').hapi;
var API = server.methods;
var log = require('server/helpers/logger');
var async = require('async');
var EVENT = '23-sinfo-conf';

API.session.list({event: EVENT}, function (err, sessions) {
  log.debug({err: err, count: sessions.length}, 'got sessions');

  async.each(sessions, function (session, cb) {

    var sessionAchievement = {
      'name': 'Went to "'+session.name+'"',
      'id': 'session-'+session.id,
      'session': session.id,
      'value': 10,
      'img': 'http://static.sinfo.org/SINFO_23/achievements/apresentacoes/session-' + session.id +'.png'
    };

    // log.debug({sessionAchievement: sessionAchievement}, 'creating achievement');

    API.achievement.create(sessionAchievement, function (err, achievement) {
      if(err) {
        log.warn({err: err, sessionAchievement: sessionAchievement}, 'achievement');
      }

      cb();
    });
  }, function (err) {
    log.info({err: err}, 'achievements created');

    process.exit(0);
  });
});
