var User = require('../models/user');
var tokenSpan = require('server').tokenSpan;
var log = require('../helpers/logger');


var validate = function (token, cb) {
	User.findOne({'bearer.token': token}, function(err, result){
    var isValid =  false;
    var credentials = {user: null, token: null};
		if(err){
			log.error({err: err, token: token},'[Auth] error finding user by token');
      return cb(err, isValid, credentials);
		}
		else if(result && !token.revoked && token.date - new Date() < tokenSpan){
      isValid = true;
      credentials.user = result;
		}
    credentials.bearer = token;
		cb(err, isValid, credentials);
	});
};

module.exports = validate;