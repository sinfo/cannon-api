var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var User = require('server/models/user');

server.method('auth.facebook', facebook, {});

function facebook(auth, cb){
  if(auth.credentials.bearer){
      if (!auth.isAuthenticated) {
        log.error({user: i});
        return cb(Boom.unauthorized('Bearer authentication invalid: ' + auth.error.message));
      }
      log.error();
      return cb(Boom.conflict('Already authenticated'));
  }
  if (!auth.isAuthenticated) {
    return cb(Boom.unauthorized('Authentication failed due to: ' + auth.error.message));
  }
  else{
    server.methods.user.get(auth.credentials.id, function(err, user){
      if(err){
        if(err.response.statusCode == 404){
          
        }
      }
    });
  }
  cb();
}