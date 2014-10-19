var server = require('server').hapi;
var log = require('../helpers/logger');


var validate = function (token, cb) {
  server.methods.user.getByToken(token, function (err, result) {
    var isValid =  false;
    var credentials = {};
    if(err){
      log.error({err: err, token: token},'[Auth] error finding user by token');
      return cb(err);
    }
    else if(result && !token.revoked){
      //check date
      isValid = true;
      credentials = result[0];
    }
    credentials.token = token;
    cb(err, isValid, credentials);
  });
};

module.exports = validate;