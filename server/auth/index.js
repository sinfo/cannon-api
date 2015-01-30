var Boom = require('boom');
var User = require('server/db/user');
var log = require('server/helpers/logger');
var async = require('async');
var jwt = require('jsonwebtoken');
var tokenConfig = require('config').token;
var Token = require('server/auth/token');


var basic = function(username, password, cb){
  log.debug({user: username, password: password}, 'On basic');
  validator(username, password, cb);
};

var bearer = function(token, cb){
  log.debug({token: token}, 'On bearer');
  validator(null, token, cb);
};

function validator(id, token, cb) {
  var isValid =  false;
  var credentials = {};
  var user = id;
  var _user;
  var bearerDecoded;
  var query;

  jwt.verify(token, tokenConfig.publicKey, {audience: tokenConfig.audience, issuer: tokenConfig.issuer}, function(err, decoded) {
    bearerDecoded = decoded;

    log.debug({decoded: decoded}, 'on verify');

    if(err){
      bearerDecoded = jwt.decode(token);
      if(bearerDecoded){
        Token.removeToken(bearerDecoded.user, token, function(error, result){
          if(error){
            log.error({err: error, token: bearerDecoded}, '[Auth] error removing invalid token');
          }
        });
      }
      return cb(Boom.unauthorized());
    }

    if(user && bearerDecoded.user != user){
      return cb(Boom.unauthorized()); 
    }

    log.debug('Still on bearer');
    query = {id: bearerDecoded.user, bearer: {$elemMatch: {token: token}}};
    log.debug({query: query});

    User.findOne(query, function(error, result){
      var bearer;
      _user = result;
      log.debug({user: result}, 'found user');

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
    }
    callback();
  }
}

exports.bearer = bearer;
exports.basic = basic;