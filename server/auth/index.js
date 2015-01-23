var Boom = require('boom');
var User = require('server/db/user');
var log = require('server/helpers/logger');
var async = require('async');
var jwt = require('jsonwebtoken');
var tokenConfig = require('config').token;
var Token = require('server/helpers/token');


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
  var resultUser;
  var bearerDecoded;
  var query;

  jwt.verify(token, tokenConfig.publicKey, {audience: tokenConfig.audience, issuer: tokenConfig.issuer}, function(err, decoded) {
    bearerDecoded = decoded;

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
    else{

      if(user && bearerDecoded.user != user){
        return cb(Boom.unauthorized()); 
      }

      query = {$and: [ {id: bearerDecoded.user}, {'bearer.token': token} ]};

      User.findOne(query, function(error, result){
        if(error){
          log.error({err: error, token: token},'[Auth] error finding user');
          return cb(Boom.unauthorized());
        }
        else if(result){
          resultUser = result;
          var tokens = result.bearer;
          async.each(tokens, checkToken, function (error){
            if(error){
              log.error({err: error},'[Auth] error running throw user tokens');
              cb(Boom.unauthorized());
            }
            return cb(null, isValid, credentials);
          });
        }
      });
    }

  });

// aux check token func used in the async
  function checkToken(userToken, callback){
    if(userToken.token == token){
      isValid = true;
      credentials.user = resultUser;
      credentials.bearer = userToken;
      callback();
    }
    else{
      callback();
    }
  }
}

exports.bearer = bearer;
exports.basic = basic;