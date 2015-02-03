var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var Boom = require('boom');
var log = require('server/helpers/logger');
var User = require('server/db/user');
var authConfig = require('config').auth;

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
  var refreshToken = jwt.sign({user: user, date: date} , authConfig.refreshToken.privateKey, refreshOptions);
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

module.exports.getJWT = getJWT;
module.exports.removeToken = removeToken;