var qr = require('qr-image');
var log = require('../../helpers/logger');
var config = require('../../../config');

var handlers = module.exports;

handlers.generate = function generate(request, reply) {
  var image = qr.image(config.url+'/r/'+request.params.id, { type: 'png' });

  reply(image);
};

module.exports = handlers;
