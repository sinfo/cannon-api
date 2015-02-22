var Boom = require('boom');
var slug = require('slug');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var fieldsParser = require('server/helpers/fieldsParser');
var Survey = require('server/db/survey');

server.method('survey.submit', submit, {});
server.method('survey.get', get, {});


function submit(sessionId, response, cb) {

  var changes = {
    $push: {
      responses: response
    },
    // If survey does not exist, lets set the sessionId
    $setOnInsert: {
      session: sessionId
    },
  };

  Survey.findOneAndUpdate({ session: sessionId }, changes, {upsert: true}, function(err, _survey) {
    if (err) {
      log.error({err: err, session: sessionId}, 'error updating survey');
      return cb(Boom.internal());
    }

    cb(null, _survey);
  });
}

function get(sessionId, cb) {

  Survey.findOne({ session: sessionId }, function(err, _survey) {
    if (err) {
      log.error({err: err, session: sessionId}, 'error getting survey');
      return cb(Boom.internal());
    }
    if (!_survey) {
      log.error({err: 'not found', session: sessionId}, 'error getting survey');
      return cb(Boom.notFound());
    }

    cb(null, _survey);
  });
}