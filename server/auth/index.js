var Boom = require('boom');
var User = require('server/db/user');
var log = require('server/helpers/logger');
var jwt = require('jsonwebtoken');
var tokenConfig = require('config').auth.token;
var Token = require('server/auth/token');


log.debug(tokenConfig);

var basic = function(username, password, cb){
  log.debug({user: username, password: password}, 'On basic');
  Token.validator(username, password, tokenConfig, cb);
};

var bearer = function(token, cb){
  log.debug({token: token}, 'On bearer');
  Token.validator(null, token, tokenConfig, cb);
};



exports.bearer = bearer;
exports.basic = basic;