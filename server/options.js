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
    },
    facebook: {
      provider: 'facebook',
      cookie: config.facebook.cookie,
      password: config.facebook.password,
      clientId: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
      isSecure: false, //while http only
      //ttl: should define ttl after
    }
	}
};