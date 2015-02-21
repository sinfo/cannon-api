var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var Resquest = require('request');
var config = require('config');
var qs = require('qs');
var parseBody = require('server/helpers/parseBody');
var moment = require('moment');


server.method('session.get', get, {});
server.method('session.list', list, {});
server.method('session.ticketsNeeded', ticketsNeeded, {});
server.method('session.surveyNotNeeded', surveyNotNeeded, {});
server.method('session.inRegistrationPeriod', inRegistrationPeriod, {});
server.method('session.inConfirmationPeriod', inConfirmationPeriod, {});


function get(id, query, cb) {
  cb = cb || query; // fields is optional

  query = (arguments.length === 2) ? {} : query;

  var url = config.deck.url+'/api/sessions/'+id+'?'+qs.stringify(query);

  Resquest.get(url, function(err, response, body) {
    if (err) {
      log.error({err: err, id: id}, 'error getting session');
      return cb(Boom.internal());
    }

    if (!body) {
      log.warn({err: err, id: id}, 'could not find session');
      return cb(Boom.notFound());
    }

    parseBody(body, function(err, session) {
      if(err) {
        return cb(Boom.create(err.statusCode, err.message || err.statusCode == 404 && 'session not found', err.data));
      }
      cb(null, session);
    });
  });
}

function list(query, cb) {
  cb = cb || query; // fields is optional

  var url = config.deck.url+'/api/sessions?'+qs.stringify(query);

  Resquest.get(url, function(err, response, body) {
    if (err) {
      log.error({err: err}, 'error getting sessions');
      return cb(Boom.internal());
    }

    if (!body) {
      log.warn({err: err}, 'could not find sessions');
      return cb(Boom.notFound());
    }

    parseBody(body, function(err, sessions) {
      if(err) {
        return cb(Boom.create(err.statusCode, err.message, err.data));
      }

      cb(null, sessions);
    });
  });
}


function ticketsNeeded(session, cb) {
  if(!session.tickets || !session.tickets.needed) {
    return cb(Boom.badRequest('this session doesn\'t need tickets'));
  }

  cb(null, true);
}

function surveyNotNeeded(session, cb) {
  if(session && session.surveyNeeded) {
    return cb(Boom.preconditionFailed('you need to submit the session survey to redeem', {session: session}));
  }

  cb(null, true);
}

function inRegistrationPeriod(session, cb) {
  var now = Date.now();
  if(now < moment(session.tickets.start) || now > moment(session.tickets.end) || now > moment(session.date)) {
    return cb(Boom.badRequest('out of registation period'));
  }

  cb(null, true);
}

function inConfirmationPeriod(session, cb) {
  var now = new Date();
  var date = new Date(session.date);

  if(date.setHours(0,0,0,0) == now.setHours(0,0,0,0)) {
    return cb(Boom.badRequest('out of confirmation period'));
  }

  cb(null, true);
}

