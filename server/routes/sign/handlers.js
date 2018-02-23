const Joi = require('joi')
const render = require('../../views/user')

exports = module.exports

exports.create = {
  tags: ['api', 'sign'],
  auth: {
    strategies: ['default'],
    scope: ['company']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Id of the company we are linking from'),
      attendeeId: Joi.string().required().description('Id of the attendee')
    },
    payload: {
      editionId: Joi.string().required().description('Id of the edition'),
      day: Joi.string().required().description('Day the company is signing the users card')
    }
  },
  pre: [
    { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, payload.editionId)', assign: 'verification' },
    { method: 'user.sign(params.attendeeId, params.companyId, payload)', assign: 'user' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.user, request.auth.credentials && request.auth.credentials.user))
  },
  description: 'Creates a new signature'
}
