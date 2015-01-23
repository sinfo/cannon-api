var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var Boom = require('boom');
var log = require('./logger');
var User = require('server/models/user');
var tokenConfig = require('config').token;

function getToken(){
  var token = {
    token: crypto.randomBytes(64).toString('hex'),
    date: Date.now()
  };
  return token;

}

function getJWT(user){
  var date = Date.now();
  var jwtoken = jwt.sign({user: user, date: date} , tokenConfig.privateKey, {
    algorithm: tokenConfig.algorithm,
    expiresInMinutes: tokenConfig.span,
    issuer: tokenConfig.issuer,
    audience: tokenConfig.audience
  });
  return {token: jwtoken, date: date};
}

function removeToken(user, token, cb){
  var update = { $pull: {bearer: {token: token} } };
  User.findOneAndUpdate({id: user}, update, function(err, result) {
    if (err) {
      log.error({err: err, requestedUser: user}, '[Auth] error removing expired token');
      return cb(Boom.internal());
    }
    cb(null, result);
  });
}

module.exports.getToken = getToken;
module.exports.getJWT = getJWT;
module.exports.removeToken = removeToken;