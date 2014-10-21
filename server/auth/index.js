var Boom = require('boom');
var User = require('../models/user');
var tokenSpan = require('server').tokenSpan;
var log = require('server/helpers/logger');
var async = require('async');
var getToken = require('server/helpers/getToken');


var basic = function(username, password, cb){
  log.debug({user: username, password: password}, 'On basic');
  validator(username, password, cb);
};

var bearer = function(token, cb){
  log.debug({token: token}, 'On bearer');
  validator(null, token, cb);
};

function validator(id, token, cb) {
  var query;
  var isValid =  false;
  var credentials = {user: null, token: null};
  var user = id;

  if(user){
    query = {$and: [ {id: user}, {'bearer.token': token} ]};
  }
  else{
    query = {'bearer.token': token};
  }

	User.findOne(query, function(err, result){
		if(err){
			log.error({err: err, token: token},'[Auth] error finding user');
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

  function checkToken(userToken, callback){
    if(userToken.token == token){
      if(!userToken.revoked && userToken.date - new Date() < tokenSpan){
        isValid = true;
        credentials.user = result;
        credentials.bearer = userToken;
        callback();
      }
      else{
        var update = { $pull: {bearer: token} };
        User.findOneAndUpdate({id: user}, update, function(err, result) {
          if (err) {
            log.error({err: err, requestedUser: id}, '[Auth] error removing expired token');
            return callback(Boom.internal());
          }
          if (!result) {
            log.error({err: err, requestedUser: id}, '[Auth] error finding required user');
            return callback(Boom.notFound());
          }
          callback(Boom.unauthorized('Expired token'));
        });
      }
    }
    else{
      callback();
    }
  }
}

exports.bearer = bearer;
exports.basic = basic;