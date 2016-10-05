var Hapi = require('hapi')
var options = require('./options')
var config = require('../config')
var log = require('./helpers/logger')

log.error({ env: process.env.NODE_ENV }, '### Starting Cannon ###')

require('./db')

var server = module.exports.hapi = new Hapi.Server(config.host, config.port, { cors: true })

server.pack.register([
    { plugin: require('hapi-swagger'), options: config.swagger },
  require('hapi-auth-bearer-token'),
  require('hapi-auth-basic')
    // { plugin: require('./plugins/templates'), options: config.templates },
],
  // { plugin: require('good'), options: options.log }],

  function (err) {
    if (err) {
      log.error({err: err}, '[hapi-plugins] problem registering hapi plugins')
      return
    }

    server.auth.strategy('default', 'bearer-access-token', options.auth.default)
    server.auth.strategy('backup', 'basic', options.auth.backup)
    server.auth.strategy('internal', 'basic', options.auth.internal)

    require('./resources')
    require('./routes')

    // Register secondary plugins
    server.pack.register([
      { plugin: require('./plugins/templates'), options: config.templates },
      { plugin: require('./plugins/surveyResults'), options: config.surveyResults }
    ], function (err) {
      if (err) throw err
      if (!module.parent) {
        server.start(function () {
          log.info('### Server started at: ' + server.info.uri + ' ###')
        })
      }
    })
  }
)
