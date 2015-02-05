var config = require('config');
var auth = require('server/auth');
var opsPath = config.logs.path + 'ops/';
var logPath = config.logs.path + 'logs/';

module.exports = {
	log: {
		opsInterval: 1800000,
		subscribers: {
      opsPath: ['ops'],
      logPath: ['request', 'log', 'error'],
    }
	},
	auth: {
    default: {
      allowQueryToken: false,
      allowMultipleHeaders: true,
      accessTokenName: 'access_token',
      validateFunc: auth.bearer
    },
    backup: {
      allowEmptyUsername: false,
      validateFunc: auth.basic
    }
	},
  upload:[
    {kind: 'cv', mimes: ['application/pdf']}
  ],
  cv: {
    expiration: 60 //days
  }
};