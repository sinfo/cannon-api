var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var Resquest = require('request');
var config = require('config');
var qs = require('qs');
var parseBody = require('server/helpers/parseBody');


server.method('session.get', get, {});
server.method('session.list', list, {});


function get(id, query, cb) {
  cb = cb || query; // fields is optional

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

    parseBody(body, cb);
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

    parseBody(body, cb);
  });
}