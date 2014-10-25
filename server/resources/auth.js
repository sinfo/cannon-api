var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var Token = require('server/helpers/token');

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
        var newToken = Token.getJWT(user.id);
        var newUser = { $push: {bearer: newToken}, 'facebook.token': auth.credentials.token};
        server.methods.user.update(user.id, newUser, function(err, result){
          if(err){
            log.error({user: auth.credentials.profile.id }, "[facebook-login] error updating user");
            return cb(err);
          }
          log.info({user: user.id}, "[facebook-login] user logged");
          return  cb(err, newToken);
        });
      }
    });
  }
}

function refreshToken(auth, cb){
  var id = auth.credentials.user.id;
  var token = auth.credentials.bearer;
  var newToken = Token.getToken();

  //NEEDS REPAIR
  var update = { $pull: {bearer: token}, $push: {bearer: newToken} };
  server.methods.user.update(id, update, function(err, result){
    if(err){
      log.error({user: id }, "[bearer] error updating user");
      return cb(err);
    }
    log.debug({user: id}, "[bearer] updated token with succcess");
    return  cb(err, Token.getJWT(id, newToken));
  });
}