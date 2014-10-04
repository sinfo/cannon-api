var logConfig = require('config').logs;

var opsPath = logConfig.path + 'ops/';
var logPath = logConfig.path + 'logs/';


module.exports = {
	server: {
	  views: {
	    path: "templates",
	    engines: {
	      html: "handlebars"
	    }
	  }
	},
	log: {
		opsInterval: 1800000,
		subscribers: {
      opsPath: ['ops'],
      logPath: ['request', 'log', 'error'],
    }
	},
	auth: {
		credentials: {
      algorithm: 'sha256',
      id: 'user',
      key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn'
    }
	}
};