var Achievement = require('server/models/achievement');
var log = require('server/helpers/logger');

var handlers = module.exports;

handlers.list = function list(request, reply) {
  Achievement.findAll(function(err, result) {
    if (err) {
      log.error({err: err, username: request.auth.credentials.id}, '[achievement] error listing achievements');
      return reply({error: 'There was an error getting all the achievements.'});
    }
    
    reply(result);
  });
};


handlers.get = function get(request, reply) {
  var achievementId = request.params.id;

  Achievement.findById(eventId, function(err, result) {
    if (err) {
      log.error({err: err, username: request.auth.credentials.id, achievement: achievementId}, '[achievement] error getting achievement %s');
      return reply({error: 'Error getting achievement with id \'' + eventId + '\'.'});
    }
    
    if (result && result.length > 0) {
      return reply(result[0]);
    }
  });

};