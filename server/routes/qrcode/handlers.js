var Joi = require('joi');
var qr = require('qr-image');
var log = require('server/helpers/logger');
var config = require('config');

var handlers = module.exports;

exports.generate = {
  validate: {
    params: {
      id: Joi.string().required().description('id of the qrcode'),
    }
  },
  handler: function (request, reply) {
    var image = qr.image(config.url+'/r/'+request.params.id, { type: 'png' });

    reply(image);
  },
  description: 'Generate a QRCode'
};

exports.redirect = {
  validate: {
    params: {
      id: Joi.string().required().description('id of the qrcode'),
    }
  },
  handler: function (request, reply) {
    reply().redirect(config.url+'/redeem/'+request.params.id);
  },
  description: 'Redirect a request from QRCode to somewhere'
};

module.exports = handlers;
