var Boom = require('boom');
var User = require('../models/user');
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
  var credentials = {user: null, token: null};
  var user = id;
  var resultUser;
  var bearerDecoded;
  var query;

  jwt.verify(token, tokenConfig.publicKey, {audience: tokenConfig.audience, issuer: tokenConfig.issuer}, function(err, decoded) {
    bearerDecoded = decoded;
  
    log.debug({decoded: bearerDecoded});

    if(err){
      bearerDecoded = jwt.decode(token);
      Token.removeToken(bearerDecoded.user, token, function(error, result){
        if(error){
          log.error({err: error, token: bearerDecoded}, '[Auth] error removing invalid token');
          return cb(error);
        }
        return cb(err, false);
      });
    }
    else{

      if(user && bearerDecoded.user != user){
        return cb(Boom.conflict('User does not match token signed user'), false); 
      }

      query = {$and: [ {id: bearerDecoded.user}, {'bearer.token': token} ]};

      User.findOne(query, function(error, result){
        if(error){
          log.error({err: error, token: token},'[Auth] error finding user');
          return cb(error, false);
        }
        else if(result){
          resultUser = result;
          var tokens = result.bearer;
          async.each(tokens, checkToken, function (error){
            if(error){
              log.error({err: error},'[Auth] error running throw user tokens');
              cb(error, false);
            }
            return cb(null, isValid, credentials);
          });
        }
      });
    }

  });

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