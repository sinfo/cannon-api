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
  var bearerDecoded;
  var query;

  jwt.verify(token, tokenConfig.publicKey, {issuer: tokenConfig.issuer}, function(err, decoded) {
    bearerDecoded = decoded;
  
    log.debug({decoded: bearerDecoded});

    if(err){
      Token.removeToken(user, bearerDecoded, function(error, result){
        if(error){
          log.error({err: error, token: bearerDecoded}, '[Auth] error removing invalid token');
        }
      });
    }

    if(user){
      query = {$and: [ {id: user}, {'bearer.token': bearerDecoded.token} ]};
    }
    else{
      query = {'bearer.token': bearerDecoded.token};
    }

    User.findOne(query, function(err, result){
      if(err){
        log.error({err: err, token: bearerDecoded.token},'[Auth] error finding user');
        return cb(err, isValid, credentials);
      }
      else if(result){
        user = result.id;
        var tokens = result.bearer;
        async.each(tokens, checkToken, function (err){
          if(err){
            log.error({err: err},'[Auth] error running throw user tokens');
          }
           return cb(err, isValid, credentials);
        });
      }
    });

  });

  function checkToken(userToken, callback){
    if(userToken.token == bearerDecoded.token){
      isValid = true;
      credentials.user = result;
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