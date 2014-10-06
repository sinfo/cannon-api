var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var User = require('server/models/user');
var crypto = require('crypto');

server.method('auth.facebook', facebook, {});

function facebook(auth, cb){
  if(auth.credentials.bearer){
      if (!auth.isAuthenticated) {
        log.error({user: auth.credentials.id, }, "[facebook-login] user trying to use invalid bearer auth");
        return cb(Boom.unauthorized('Bearer authentication invalid: ' + auth.error.message));
      }
      log.error({user: auth.credentials.id, }, "[facebook-login] user already authenticated");
      return cb(Boom.conflict('Already authenticated'));
  }
  if (!auth.isAuthenticated) {
    log.error({user: auth.credentials.id, }, "[facebook-login] facebook auth failed");
    return cb(Boom.unauthorized('Authentication failed due to: ' + auth.error.message));
  }
  else{
    server.methods.user.get(auth.credentials.id, function(err, user){
      if(err){
        log.error({err: err.output.user, user: auth.credentials.id, }, "[facebook-login] error getting user");
        return cb(err);
      }
      else{
        user.facebook.id = auth.credentials.id;
        user.facebook.token = auth.credentials.token;
        user.mail = auth.credentials.mail;
        var token = crypto.randomBytes(64).toString('hex');
        console.log(token);
      }
    });
  }
  cb();
}

function getToken(){

}