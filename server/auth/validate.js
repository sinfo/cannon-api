var User = require('../models/user');
var log = require('../helpers/logger');


var validate = function (token, callback) {
	User.find({token: token}, function(err, result){
    var isValid =  false;
    var credentials = {};
		if(err){
			log.error({err: err, token: token},'[Auth] error finding user by token');
		}
		else if(result && result.length > 0){
      isValid = true;
      credentials = result[0];
		}
    credentials.token = token;
		callback(err, isValid, credentials);
	});
};

module.exports = validate;