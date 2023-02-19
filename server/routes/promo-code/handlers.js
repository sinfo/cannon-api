const render = require('../../views/promo-code')

exports = module.exports

exports.find = {
  options:{
    tags: ['api', 'promo-codes'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin'],
      mode: 'try'
    },
    description: 'Gets all available promo codes'
  },

  handler: async (request, h) =>{
    try{
      let code = await request.server.methods.promoCode.get()
      if(!code) {
        log.error({ err: err}, 'error getting promo code')
        throw Boom.notFound()
      }
      return h.response(render(code))
    }catch (err) {
      log.error({ err: err }, 'could not find promo code')
      throw Boom.internal()
    }
  }
}
