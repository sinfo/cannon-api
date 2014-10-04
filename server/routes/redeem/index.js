var server     = require('server').hapi;
var handlers   = require('./handlers');
var validators = require('./validators');

server.route({
  method: 'GET',
  path: '/api/redeem',
  config: {
    handler: handlers.list,
    auth: true,
    validate: {
      params: false,
      query: false
    }
  }
});

server.route({
  method: 'GET',
  path: '/api/redeem/{id}',
  config: {
    handler: handlers.get,
    auth: true,
    validate: validators.get
  }
});

server.route({
  method: 'PUT',
  path: '/api/redeem/{id}',
  config: {
    handler: handlers.update,
    auth: true,
    validate: validators.update
  }
});

server.route({
  method: 'POST',
  path: '/api/redeem',
  config: {
    handler: handlers.create,
    auth: true,
    validate: validators.create
  }
});
