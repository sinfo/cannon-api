var Hapi = require('hapi');
var options = require('./options');
require('./db');

var server = module.exports = new Hapi.Server(8080, options);

server.pack.require('hapi-auth-cookie', function (err) {
  server.auth.strategy('session', 'cookie', {
    password: 'secret',
    cookie: 'sid-example',
    redirectTo: '/login',
    isSecure: false
  });

  var routes = require('./routes');

  server.start(function () {
    console.log('Server started at: ' + server.info.uri);
  });
});
