const Joi = require('joi')
const render = require('../../views/promo-code')

exports = module.exports

exports.find = {
  tags: ['api', 'promo-codes'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  pre: [
    { method: 'promoCode.get()', assign: 'codes' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.codes))
  },
  description: 'Gets all available promo codes'
}
