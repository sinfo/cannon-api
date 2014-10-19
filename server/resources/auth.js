var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var crypto = require('crypto');

server.method('auth.facebook', facebook, {});
server.method('auth.getToken', facebook, {});
server.method('auth.refreshToken', facebook, {});

function facebook(auth, cb){
  if(auth.credentials.bearer){
      if (!auth.isAuthenticated) {
        log.error({user: auth.credentials.id }, "[facebook-login] user trying to use invalid bearer auth");
        return cb(Boom.unauthorized('Bearer authentication invalid: ' + auth.error.message));
      }
      log.error({user: auth.credentials.id }, "[facebook-login] user already authenticated");
      return cb(Boom.conflict('Already authenticated'));
  }
  if (!auth.isAuthenticated) {
    log.error({user: auth.credentials.profile.id }, "[facebook-login] facebook auth failed");
    return cb(Boom.unauthorized('Authentication failed due to: ' + auth.error.message));
  }
  else{
    server.methods.user.get(auth.credentials.profile.id, function(err, user){
      if(err){
        log.error({err: err, user: auth.credentials.id }, "[facebook-login] error getting user");
        return cb(err);
      }
      else{
        user.facebook.token = auth.credentials.token;
        user.bearer.push(getToken());
        server.methods.user.update(user.id, user, function(err, result){
          if(err){
            log.error({user: auth.credentials.profile.id }, "[facebook-login] error updating user");
          }
          log.info({user: user.id}, "[facebook-login] user logged");
          return  cb(err, user.bearer);
        });
      }
    });
  }
}

function getToken(){
  var token = {
    token: crypto.randomBytes(64).toString('hex'),
    date: Date.now(),
    revoked: false
  };
  return token;
}

function refreshToken(id, token, cb){
  server.methods.user.get(id, function(err, user){
    if(err){
      log.error({user: auth.credentials.id, requestedUser: id}, "[bearer] error getting user");
      return cb(err);
    }
    if(user.bearer.token == token && !user.bearer.revoked && !token.revoked){
      var bearer = {bearer: getToken()};
      server.methods.user.update(id, bearer, function(err, result){
        if(err){
          log.error({user: auth.credentials.profile.id }, "[bearer] error updating user");
        }
        log.debug({user: user.id}, "[bearer] user refreshed token");
        return  cb(err, bearer);
      });
    }
    else{
      return cb(Boom.unauthorized('Bearer authentication invalid'));
    }
  });
}