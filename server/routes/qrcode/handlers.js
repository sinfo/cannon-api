const Joi = require('joi')
const qr = require('qr-image')
const config = require('../../../config')

exports = module.exports

exports.generate = {
  options:{
    tags: ['api', 'qrcode'],
    auth: false,
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('id of the qrcode')
      })
    },
    description: 'Generate a QRCode'
  },
  handler: function (request, reply) {
    const image = qr.image(config.url + '/r/' + request.params.id, { type: 'png' })

    reply(image)
  },
}

exports.redirect = {
  options:{
    tags: ['api', 'qrcode'],
    auth: false,
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('id of the qrcode')
      })
    },
    description: 'Redirect a request from QRCode to somewhere'
  },
  handler: function (request, reply) {
    reply().redirect(config.webapp.url + '/survey/' + request.params.id)
  },
}
