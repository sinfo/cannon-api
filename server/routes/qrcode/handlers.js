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
  handler: async function (request, h) {
    // Try to be smart: if the id matches an achievement id, redirect to its survey.
    // Otherwise, if it matches a session-backed achievement (session id), try to find that
    // achievement and redirect to its survey. Log details to help debug 'file not found' issues.
    const Achievement = require('../../db/achievement')
    const id = request.params.id
    try {
      // 1) direct achievement id
      let ach = await Achievement.findOne({ id: id }).lean()
      if (ach) {
        request.log(['qrcode', 'redirect'], { id, found: 'achievement', achievementId: ach.id })
        return h.redirect(config.webapp.url + '/survey/' + ach.id)
      }

      // 2) session id -> find achievement by session
      ach = await Achievement.findOne({ session: id }).lean()
      if (ach) {
        request.log(['qrcode', 'redirect'], { id, found: 'session', achievementId: ach.id })
        return h.redirect(config.webapp.url + '/survey/' + ach.id)
      }

      // fallback: redirect to survey with id (previous behavior) but log for investigation
      request.log(['qrcode', 'redirect', 'miss'], { id, msg: 'no matching achievement or session found' })
      return h.redirect(config.webapp.url + '/survey/' + id)
    } catch (err) {
      request.log(['qrcode', 'redirect', 'error'], { err, id })
      // Return a plain 404 page to avoid endless redirects to webapp for missing resources
      return h.response('Not found').code(404)
    }
  },
}
