var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var facebook = require('server/helpers/facebook');
var Token = require('server/helpers/token');

server.method('auth.facebook', facebookAuth, {});
server.method('auth.refreshToken', refreshToken, {});

function facebookAuth(id, token, cb){
  facebook.debugToken(id, token, function(err, isValid) {
    if(err) {
      return cb(Boom.unauthorized(err));
    }

    if(!isValid) {
      return cb(Boom.unauthorized('nice try'));
    }

    server.methods.user.get(id, function(err, user){
      if(err) {
        log.error({err: err, facebook: id }, '[facebook-login] error getting user');
        return cb(err);
      }

      var newToken = Token.getJWT(user.id);
      var changedAttributes = { $push: {bearer: newToken}, 'facebook.token': token};

      server.methods.user.update(user.id, changedAttributes, function(err, result){
        if(err){
          log.error({user: user.id }, '[facebook-login] error updating user');
          return cb(err);
        }
        log.info({user: user.id}, '[facebook-login] user logged');
        return  cb(err, newToken);
      });
    });
  });
}

function refreshToken(auth, cb){
  var id = auth.credentials.user.id;
  var token = auth.credentials.bearer;
  var newToken = Token.getToken();

  //NEEDS REPAIR
  var update = { $pull: {bearer: token}, $push: {bearer: newToken} };
  server.methods.user.update(id, update, function(err, result){
    if(err){
      log.error({user: id }, '[bearer] error updating user');
      return cb(err);
    }
    log.debug({user: id}, '[bearer] updated token with succcess');
    return  cb(err, Token.getJWT(id, newToken));
  });
}