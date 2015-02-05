var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var Boom = require('boom');
var log = require('server/helpers/logger');
var User = require('server/db/user');
var authConfig = require('config').auth;
var async = require('async');

function getJWT(user){
  var date = Date.now();
  var tokenOptions = {
    algorithm: authConfig.token.algorithm,
    expiresInMinutes: authConfig.token.ttl,
    issuer: authConfig.token.issuer,
    audience: authConfig.token.audience
  };
  var refreshOptions = {
    algorithm: authConfig.refreshToken.algorithm,
    expiresInMinutes: authConfig.refreshToken.ttl,
    issuer: authConfig.refreshToken.issuer,
    audience: authConfig.refreshToken.audience
  };
  var token = jwt.sign({user: user, date: date} , authConfig.token.privateKey, tokenOptions);
  var refreshToken = jwt.sign({user: user, refresh: true, date: date} , authConfig.refreshToken.privateKey, refreshOptions);
  return {token: token, refreshToken: refreshToken, ttl: authConfig.token.ttl, date: date};
}

function removeToken(token, user, cb){
  var filter = cb ? {id: user} : {bearer: {$elemMatch: {token: token}}};
  var update = { $pull: {bearer: {token: token} } };
  cb = (cb || user);

  User.findOneAndUpdate(filter, update, function(err, result) {
    if (err) {
      log.error({err: err, requestedUser: user}, '[Auth] error removing expired token');
      return cb(Boom.internal());
    }
    cb(null, result);
  });
}

function validator(id, token, config, cb) {
  var isValid =  false;
  var credentials = {};
  var user = id;
  var _user;
  var bearerDecoded;
  var query;

  jwt.verify(token, config.publicKey, {audience: config.audience, issuer: config.issuer}, function(err, decoded) {
    bearerDecoded = decoded;

    if(err){
      log.warn({err: err, token: bearerDecoded}, '[Auth] invalid token');
      return cb(Boom.unauthorized());
    }

    if(user && bearerDecoded.user != user){
      return cb(Boom.unauthorized()); 
    }

    query = {id: bearerDecoded.user, bearer: {$elemMatch: {token: token}}};

    User.findOne(query, function(error, result){
      var bearer;
      _user = result;
      
      if(error){
        log.error({err: error, token: token},'[Auth] error finding user');
        return cb(Boom.unauthorized());
      }

      if(!_user){
        log.error({err: error, token: token},'[Auth] user not found');
        return cb(Boom.unauthorized());
      }

      bearer = _user.bearer;
      async.each(bearer, checkToken, function (error){
        if(error){
          log.error({err: error},'[Auth] error running throw user tokens');
          return cb(Boom.unauthorized());
        }
        return cb(null, isValid, credentials);
      });
    });

  });

// aux check token func used in the async
  function checkToken(userBearer, callback){
    if(userBearer.token == token){
      isValid = true;
      credentials.user = _user;
      credentials.bearer = userBearer;
      credentials.scope = _user.role;
    }
    callback();
  }
}

module.exports.validator = validator;
module.exports.getJWT = getJWT;
module.exports.removeToken = removeToken;