const Hapi = require('@hapi/hapi')
const options = require('./options')
const config = require('../config')
const log = require('./helpers/logger')
require('./db')

log.info({ env: process.env.NODE_ENV }, '### Starting Cannon ###')

const server = module.exports.hapi = new Hapi.Server({
  host: config.host,
  port: config.port,
  routes:{ 
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['*sinfo.org', '*cannon.sinfo.org']
        : ['http://localhost:*']
    }
  }
})

server.register(
  [
    { plugin: require('hapi-swagger'), options: config.swagger },
    require('hapi-auth-bearer-token'),
    require('@hapi/basic'),
    require('@hapi/vision'),
    require('@hapi/inert')
  ]).then(() => {


      server.auth.strategy('default', 'bearer-access-token', options.auth.default)
      server.auth.strategy('internal', 'basic', options.auth.internal)

      require('./resources')
      require('./routes')

      // Register secondary plugins
      server.register(
        { plugin: require('./plugins/templates'), options: config.templates }).then(
        () => {        
        if (!module.parent) {
          server.start().then(() => {
            log.info('### Server started at: ' + server.info.uri + ' ###')
            return server
          })
        }
      })
    }
)
