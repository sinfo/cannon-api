var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var User = require('server/models/user');

server.method('auth.facebook', facebook, {});

function facebook(auth, cb){
  if (!auth.isAuthenticated) {
    return cb(Boom.internal('Authentication failed due to: ' + auth.error.message));
  }
  cb();
}