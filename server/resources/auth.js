var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var facebook = require('server/helpers/facebook');
var Token = require('server/auth/token');

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

    server.methods.user.get({'facebook.id': id}, function(err, user){
      if(err) {
        if(!err.output || err.output.statusCode != 404) {
          log.error({err: err, facebook: id }, '[facebook-login] error getting user');
          return cb(err);
        }

        // This facebook id is not on db, let's find out who it belongs to
        return facebook.getMe(token, function(err, facebookUser) {
          if(err){
            log.error({err: err, id: id, token: token }, '[facebook-login] error retrieving user info from facebook');
            return cb(Boom.unauthorized('couldn\'t retrieve your info from facebook'));
          }

          var changedAttributes = {
            facebook: {
              id: facebookUser.id,
              token: token
            }
          };

          // If user does not exist, lets set the id, name and email
          changedAttributes.$setOnInsert = {
            id: Math.random().toString(36).substr(2,20), // generate random id
            name: facebookUser.name,
            mail: facebookUser.email,
          };

          log.debug({facebookUser: facebookUser.id}, '[facebook-login] got facebook user');

          // Update the facebook details of the user with this email, ou create a new user if it does not exist
          return server.methods.user.update({mail: facebookUser.email}, changedAttributes, {upsert: true}, function(err, result){
            if(err){
              log.error({user: {mail: facebookUser.email}, changedAttributes: changedAttributes }, '[facebook-login] error upserting user');
              return cb(err);
            }

            log.debug({id: result.id}, '[facebook-login] upserted user');

            return authenticate(result.id, null, cb);
          });
        });
      }

      var changedAttributes = { 'facebook.token': token };

      return authenticate(user.id, changedAttributes, cb);
    });
  });
}


function authenticate(userId, changedAttributes, cb) {
  var newToken = Token.getJWT(userId);
  changedAttributes = changedAttributes || {};
  changedAttributes.$push = { bearer: newToken };

  server.methods.user.update({id: userId}, changedAttributes, function(err, result){
    if(err){
      log.error({user: userId, changedAttributes: changedAttributes }, '[facebook-login] error updating user');
      return cb(err);
    }
    log.info({user: userId}, '[facebook-login] user logged in ');
    return  cb(err, {id: userId, token: newToken.token});
  });
}

function refreshToken(auth, cb){
  var id = auth.credentials.user.id;
  var token = auth.credentials.bearer;
  var newToken = Token.getJWT();

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