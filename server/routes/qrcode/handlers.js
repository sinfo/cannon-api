var qr = require('qr-image');
var log = require('server/helpers/logger');
var config = require('config');

var handlers = module.exports;

handlers.generate = function generate(request, reply) {
  var image = qr.image(config.url+'/r/'+request.params.id, { type: 'png' });

  reply(image);
};

handlers.redirect = function redirect(request, reply) {
  reply().redirect(config.url+'/redeem/'+request.params.id);
};

module.exports = handlers;
