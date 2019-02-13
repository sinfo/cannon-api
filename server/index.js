const Hapi = require('hapi')
const options = require('./options')
const config = require('../config')
const log = require('./helpers/logger')
require('./db')

log.info({ env: process.env.NODE_ENV }, '### Starting Cannon ###')

const server = module.exports.hapi = new Hapi.Server(config.host, config.port, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
    ? ['*sinfo.org']
    : ['http://localhost:*']
  }
})

server.pack.register(
  [
    // { plugin: require('./plugins/templates'), options: config.templates },
    // { plugin: require('good'), options: options.log }],
    { plugin: require('hapi-swagger'), options: config.swagger },
    require('hapi-auth-bearer-token'),
    require('hapi-auth-basic')
  ],
  (err) => {
    if (err) {
      log.error({err: err}, '[hapi-plugins] problem registering hapi plugins')
      return
    }

    server.auth.strategy('default', 'bearer-access-token', options.auth.default)
    server.auth.strategy('internal', 'basic', options.auth.internal)

    require('./resources')
    require('./routes')

    // Register secondary plugins
    server.pack.register([
      { plugin: require('./plugins/templates'), options: config.templates },
      { plugin: require('./plugins/surveyResults'), options: config.surveyResults }
    ], (err) => {
      if (err) throw err
      if (!module.parent) {
        server.start(() => {
          log.info('### Server started at: ' + server.info.uri + ' ###')
        })
      }
    })
  }
)
