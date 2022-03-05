var Hoek = require('hoek')
var Path = require('path')
var Handlebars = require('handlebars')

var handlers = require('./handlers')

// Declare internals
var internals = {
  defaults: {
    endpoint: '/templates',
    auth: false,
    basePath: Path.join(__dirname, 'templates'),
    partialsPath: Path.join(__dirname, 'templates')
  }
}

exports.register = function (plugin, options, next) {
  var settings = Hoek.clone(internals.defaults)
  Hoek.merge(settings, options)

  plugin.views({
    engines: settings.engines || {
      hbs: {
        module: Handlebars
      }
    },
    path: settings.basePath
  })

  plugin.route({
    method: 'GET',
    path: settings.endpoint + '/achievements/{achievementId}',
    config: handlers.grid
  })

}

exports.register.attributes = {
  pkg: require('./package.json')
}

exports.name = 'templates'
