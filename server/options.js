var logConfig = require('config').logs;
var bearer = require('server/auth/bearer');

var opsPath = logConfig.path + 'ops/';
var logPath = logConfig.path + 'logs/';


module.exports = {
	log: {
		opsInterval: 1800000,
		subscribers: {
      opsPath: ['ops'],
      logPath: ['request', 'log', 'error'],
    }
	},
	auth: {
		allowQueryToken: false,
    allowMultipleHeaders: false,
    accessTokenName: 'access_token',
    validateFunc: bearer
	}
};