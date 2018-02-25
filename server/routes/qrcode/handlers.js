const Joi = require('joi')
const qr = require('qr-image')
const config = require('../../../config')

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
    const image = qr.image(config.url + '/r/' + request.params.id, { type: 'png' })

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
    reply().redirect(config.webapp.url + '/survey/' + request.params.id)
  },
  description: 'Redirect a request from QRCode to somewhere'
}
