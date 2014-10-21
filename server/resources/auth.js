var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var getToken = require('server/helpers/getToken');

server.method('auth.facebook', facebook, {});
server.method('auth.refreshToken', facebook, {});

function facebook(auth, cb){
  if(auth.credentials.bearer){
      if (!auth.isAuthenticated) {
        log.error({user: auth.credentials.user.id }, "[facebook-login] user trying to use invalid bearer auth");
        return cb(Boom.unauthorized('Bearer authentication invalid: ' + auth.error.message));
      }
      log.error({user: auth.credentials.user.id }, "[facebook-login] user already authenticated");
      return cb(Boom.conflict('Already authenticated'));
  }
  if (!auth.isAuthenticated) {
    log.error({user: auth.credentials.profile.id }, "[facebook-login] facebook auth failed");
    return cb(Boom.unauthorized('Authentication failed due to: ' + auth.error.message));
  }
  else{
    server.methods.user.get(auth.credentials.profile.id, function(err, user){
      if(err){
        log.error({err: err, user: auth.credentials.profile.id }, "[facebook-login] error getting user");
        return cb(err);
      }
      else{
        var newToken = getToken();
        var newUser = { $push: {bearer: newToken}, 'facebook.token': auth.credentials.token};
        server.methods.user.update(user.id, newUser, function(err, result){
          if(err){
            log.error({user: auth.credentials.profile.id }, "[facebook-login] error updating user");
          }
          else{
            log.info({user: user.id}, "[facebook-login] user logged");
          }
          return  cb(err, user.bearer);
        });
      }
    });
  }
}

function refreshToken(auth, cb){
  var id = auth.credentials.user.id;
  var token = auth.credentials.bearer;
  var newToken = { $pull: {bearer: token}, $push: {bearer: getToken()} };
  server.methods.user.update(id, newToken, function(err, result){
    if(err){
      log.error({user: id }, "[bearer] error updating user");
    }
    else{
      log.debug({user: id}, "[bearer] updated token with succcess");
    }
    return  cb(err, bearer);
  });
}