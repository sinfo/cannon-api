var Joi = require('joi')
var qr = require('qr-image')
var config = require('config')

exports = module.exports

exports.generate = {
  tags: ['api', 'qrcode'],
  auth: false,
  validate: {
    params: {
      id: Joi.string().required().description('id of the qrcode')
    }
  },
  handler: function (request, reply) {
    var image = qr.image(config.url + '/r/' + request.params.id, { type: 'png' })

    reply(image)
  },
  description: 'Generate a QRCode'
}

exports.redirect = {
  tags: ['api', 'qrcode'],
  auth: false,
  validate: {
    params: {
      id: Joi.string().required().description('id of the qrcode')
    }
  },
  handler: function (request, reply) {
    reply().redirect(config.webapp.url + '/redeem/' + request.params.id)
  },
  description: 'Redirect a request from QRCode to somewhere'
}
