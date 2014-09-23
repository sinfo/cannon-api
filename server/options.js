var logConfig = require('../config').logs;

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
		opsInterval : 1800000,
		subscribers: {
      opsPath: ['ops'],
      logPath: ['request', 'log', 'error'],
    }
	}
};