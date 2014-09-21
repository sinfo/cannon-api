var logConfig = require('../config').logs;

module.exports = {
	server: {
	  views: {
	    path: "templates",
	    engines: {
	      html: "handlebars"
	    }
	  }
	}
	log: {
		opsInterval : 1800000
		subscribers: {
      logConfig.path + 'ops/':            ['ops'],
      logConfig.path + 'logs/':           ['request', 'log', 'error'],
    }
	}
};