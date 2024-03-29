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
  handler: (request, h) =>{
    const image = qr.image(config.url + '/r/' + request.params.id, { type: 'png' })
    return h.response(image)
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
  handler: function (request, h) {
    h.response().redirect(config.webapp.url + '/survey/' + request.params.id)
  },
}
