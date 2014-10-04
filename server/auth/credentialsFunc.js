var User = require('../models/user');
var log = require('../helpers/logger');
var credentials = require('../options').auth.credentials;


var getCredentials = function (id, callback) {
	User.findById(id, function(err, result){
		if(err){
			log.error('[Auth] error acquiring credentials for id: ' + id, err);
		}
		else{
			credentials.id = id;
			credentials.key = result.key;
		}
		return callback(err, credentials);
	});
};

module.exports = getCredentials;