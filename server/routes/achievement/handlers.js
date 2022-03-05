const Joi = require('joi')
const render = require('../../views/achievement')
const log = require('../../helpers/logger')
const Boom = require('boom')

exports = module.exports

exports.create = {
  options:{
    tags: ['api', 'achievement'],
    auth: {
      strategies: ['default'],
      scope: ['admin']
    },
    validate: {
      payload: Joi.object({
        id: Joi.string().description('Id of the achievement'),
        name: Joi.string().required().description('Name of the achievement'),
        event: Joi.string().default('22').description('Event the achievement is associated to'),
        session: Joi.string().description('Id of a session associated to this achievement'),
        img: Joi.string().description('Image of the achievement'),
        description: Joi.string().description('Description of the achievement'),
        category: Joi.string().description('Category of the achievement'),
        instructions: Joi.string().description('Instructions on how to get the achievement'),
        value: Joi.number().description('Amount of points associated to the achievement'),
        validity: Joi.object().keys({
          from: Joi.date().description('Date when the achievement starts being available for grabs'),
          to: Joi.date().description('Date when the achievement starts stops being available for grabs')
        }),
        kind: Joi.string().description('Kind of achievement (cv, for example)')
      })
    },
    description: 'Creates a new achievement',
  },
  handler: async (request, h) =>{
    try{
      let ach = await request.server.methods.achievement.create(request.payload)
      return h.response(render(ach)).created('/achievement/' + ach.id)
    }catch (err) {
      if (err.code === 11000) {
        log.error({msg: "achievement is a duplicate" })
        return Boom.conflict(`achievement "${achievement.id}" is a duplicate`)
      }

      log.error({ err: err, msg:'error creating achievement'}, 'error creating achievement')
      return Boom.internal()
    }
  }
}

exports.update = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['admin']
  },
  validate: {
    params: Joi.object({
      id: Joi.string().required().description('Id of the achievement we want to update')
    }),
    payload: Joi.object({
      name: Joi.string().description('Name of the achievement'),
      event: Joi.string().description('Event the achievement is associated to'),
      session: Joi.string().description('Id of a session associated to this achievement'),
      category: Joi.string().description('Category of the achievement'),
      description: Joi.string().description('Description of the achievement'),
      instructions: Joi.string().description('Instructions on how to get the achievement'),
      img: Joi.string().description('Image of the achievement'),
      value: Joi.number().description('Amount of points associated to the achievement'),
      validity: Joi.object().keys({
        from: Joi.date().description('Date when the achievement starts being available for grabs'),
        to: Joi.date().description('Date when the achievement starts stops being available for grabs')
      })
    })
  },
  description: 'Updates an achievement'},
  handler: async (request, h) =>{
    try{
      let ach = await request.server.methods.achievement.update(request.params.id, request.payload)
      if (!ach) {
        log.error({ err: err, achievement: filter }, 'error updating achievement')
        return Boom.notFound()
      }
      return h.response(render(ach))
    }catch (err) {
      log.error({ err: err, achievement: filter }, 'error updating achievement')
      return Boom.internal()
    }
  }
}

exports.get = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: Joi.object({
      fields: Joi.string().description('Fields we want to retrieve')
    }),
    params: Joi.object({
      id: Joi.string().required().description('Id of the achievement we want to retrieve')
    })
  },
  description: 'Gets an achievement'
},
  handler: async (request, h) =>{
    try{
      let ach = await request.server.methods.achievement.get(request.params.id)
      if (!ach) {
        log.error({ err: err, achievement: filter }, 'error getting achievement')
        return Boom.notFound()
      }
      return h.response(render(ach))
    }catch (err) {
      log.error({ err: err, achievement: filter }, 'error getting achievement')
      return Boom.internal()
    }
  }
}

exports.getMe = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  description: 'Gets my achievements'
},
  handler: async (request, h) =>{
    try{
      let ach = await request.server.methods.achievement.getByUser(request.auth.credentials.user.id)
      if (!ach) {
        log.error({ err: err, achievement: filter }, 'error getting achievement')
        return Boom.notFound()
      }
      return h.response(render(ach))
    }catch (err) {
      log.error({ err: err, achievement: filter }, 'error getting achievement')
      return Boom.internal()
    }
  }
}

exports.removeMe = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  description: 'Removes all my achievements'
},
  handler: async (request, h) =>{
    try{
      let ach = await request.server.methods.achievement.removeAllFromUser(request.auth.credentials.user.id)
      if (!ach) {
        log.error({ err: 'not found', userId: userId }, 'achievements not found')
        return Boom.notFound('achievements not found')
      }
      return h.response(render(ach))
    }catch (err) {
      log.error({ err: err, userId: userId }, 'error removing user from multiple achievements')
      return Boom.internal('error getting achievements')
    }
  }
}

exports.getActive = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: Joi.object({
      date: Joi.date().description('all achievements active on this date')
    })
  },
  description: 'Gets active achievements'
},
  handler: async (request, h) =>{
    try{
      let ach = await request.server.methods.achievement.getActiveAchievements(request.query)
      return h.response(render(ach))
    }catch (err) {
      log.error({ err: err, date: date }, 'error getting active achievements on a given date')
      return Boom.boomify(err)
    }
  }
}

exports.getMeActive = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  pre: [
    { method: function(request, h) {
      return  request.server.methods.achievement.getActiveAchievements()
    }, assign: 'activeAchievements' },
    { method: function(request, h){
      return  request.server.methods.achievement.getPointsForUser(request.pre.activeAchievements, request.auth.credentials.user.id)
    }, assign: 'result' }
  ],
  description: 'Gets my active achievements and my points'
},
  handler: async function (request, h) {
    try{
      let active = await request.server.methods.achievement.getActiveAchievements()

      let result = request.server.methods.achievement.getPointsForUser(active, request.auth.credentials.user.id)

      return h.response(result)
    }catch(err){
      log.error({ err: err, date: date }, 'error getting active achievements on a given date')
      return Boom.boomify(err)
    }
  },
}

exports.getMeSpeed = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  description: 'Gets my speed dating achievements'
},
  handler: async function (request, h) {
    try{
      const result = { achievements: [], points: 0 }
      let achievements = request.server.methods.achievement.getSpeedDatePointsForUser(request.auth.credentials.user.id)
      achievements.forEach(ach => {
        result.points += getSpeedDatePoints(ach, userId)
        result.achievements.push({
          achievement: ach,
          frequence: userFrequence(ach, userId)
        })
      })
      return h.response(achievements)
    }catch(err){
      log.error({err: err}, 'Error finding achievements')
      return Boom.boomify(err)
    }
  },
}

exports.getUser = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: Joi.object({
      fields: Joi.string().description('Fields we want to retrieve')
    }),
    params: Joi.object({
      id: Joi.string().required().description('Id of the user we want to retrieve')
    })
  },
  description: 'Gets user achievements'
},
  handler: async function (request, h) {
    try{
      let achievements = await request.server.methods.achievement.getByUser(request.params.id)
      return h.response(render(achievements))
    }catch(err){
      log.error({err: err}, 'Error finding achievements')
      return Boom.boomify(err)
    }
  },
}

exports.list = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: Joi.object({
      fields: Joi.string().description('Fields we want to retrieve'),
      sort: Joi.string().description('Sort fields we want to retrieve'),
      skip: Joi.number().description('Number of documents we want to skip'),
      limit: Joi.number().description('Limit of documents we want to retrieve')
    })
  },
  description: 'Gets all the achievements'
},
  handler: function (request, h) {
    try{
      let achievements = await request.server.methods.achievement.list(request.query)
      return h.response(render(request.pre.achievements))
    }catch(err){
      log.error({err: err}, 'Error finding achievements')
      return Boom.boomify(err)
    }
  },
}

exports.remove = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['admin']
  },
  validate: {
    params: Joi.object({
      id: Joi.string().required().description('Id of the achievement we want to remove')
    })
  },
  description: 'Removes an achievement'
},
  handler: async function (request, h) {
    try{
      let ach = await request.server.methods.achievement.remove(request.params.id)
      if(!ach){
        log.error({ id: request.params.id, error: err })
        return Boom.notFound('achievement not found')
      }
      return render(ach)
    }catch (err) {
      log.error({ info: request.info, error: err })
      return Boom.boomify(err)
    }
  },
}

exports.listWithCode = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: Joi.object({
      start: Joi.date().description('Start of validity period'),
      end: Joi.date().description('End of validity period'),
      kind: Joi.string().description('Kind of achievements we want')
    })
  },
  description: 'Lists all achievements, with self sign codes'
},
  handler: async function (request, h) {
    try{
      let achievements = await request.server.methods.achievement.getActiveAchievementsCode(request.query)
      return h.response(render(achievements, true))
    }catch(err){
      log.error({err: err}, 'Error finding achievements')
      return Boom.boomify(err)
    }
  },
}
exports.getWithCode = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin'],
    mode: 'try'
  },
  validate: {
    query: Joi.object({
      fields: Joi.string().description('Fields we want to retrieve')
    }),
    params: Joi.object({
      id: Joi.string().required().description('Id of the achievement we want to retrieve')
    })
  },
  description: 'Gets an achievement, with self sign codes'
},
  handler: function (request, h) {
    try{
      let ach = await request.server.methods.achievement.get(request.params.id)
      if(!ach){
        log.error({err: err}, 'Error finding achievement')
        return Boom.notFound('Error finding achievement') 
      }
      return h.response(render(ach, true))
    }catch(err){
      log.error({err: err}, 'Error finding achievements')
      return Boom.boomify(err)
    }
  },
}

exports.createSecret = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    payload: Joi.object({
      validity: Joi.date().description('Date when the achievement starts stops being available for grabs').required(),
      event: Joi.string().description('Event the achievement is associated to').required(),
      points: Joi.number().description('Value of the achievement').required()
    })
  },
  description: 'Creates a new secret achievement'
},
  handler: async function (request, h) {
    try{
      let achs = await request.server.methods.achievement.createSecret(request.payload)
      if (achs === null) {
        log.error('error trying to create secret achievement')
        return Boom.boomify('error trying to create secret achievement')
      }
      
      const n = achs.length

      const from = new Date()
      const to = new Date(from)
      from.setHours(0)
      from.setMinutes(0)
      from.setSeconds(0)
      from.setMilliseconds(0)

      to.setHours(23)
      to.setMinutes(59)
      to.setSeconds(59)
      to.setMilliseconds(999)

      const code = randomString(12)

      const achievement = {
        name: 'Secret Achievement!',
        id: `${payload.event}_secret_achievement_${n}`,
        description: 'Secret achievement valid for a limited time!',
        instructions: 'Redeem the code that appears in the chat at random times!',
        img: `https://sinfo.ams3.cdn.digitaloceanspaces.com/static/${payload.event}/achievements/secret_code.webp`,
        value: payload.points > 0 ? payload.points : 10,
        users: [],
        validity: {
          from: from,
          to: to
        },
        code: {
          code: code
        },
        kind: AchievementKind.SECRET
      }

      achievement.updated = achievement.created = achievement.code.created = Date.now()
      const expiration = new Date(payload.validity)
      if (expiration <= achievement.code.created) {
        log.error({expires: expiration}, 'expiration date is in the past')
        return Boom.badRequest()
      }
      achievement.code.expiration = expiration

      let ach = await request.server.methods.achievement.create(achievement)
      return h.response(render(ach, true)).created('/achievement/' + ach.id)
    }catch(err){
      log.error({ err: err, achievement: achievement.id }, 'error creating achievement')
      return Boom.internal()
    }
  },
}

exports.signSecret = {
  options:{
  tags: ['api', 'achievement'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin', 'user'],
    mode: 'try'
  },
  validate: {
    payload: Joi.object({
      code: Joi.string().description('Validation code for self signing')
    })
  },
  description: 'Perform check-in in a session for an array of users, giving its achievement to each of them'
},
  handler: async function (request, h) {
    try{
      let ach = await request.server.methods.achievement.addUserToSecret(request.auth.credentials.user.id, request.payload.code)
      if (ach === null) {
        log.error({ code: code }, 'no valid secret achievements with that code')
        return Boom.notFound('no valid secret achievements with that code')
      }
      return h.response(render(ach))
    }catch(err){
      log.error({ err: err }, 'error adding user to secret achievement')
      return Boom.internal()
    }
  },
}

exports.getAchievementBySession = {
  options:{
  tags: ['api', 'achievement', 'session'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    params: Joi.object({
      id: Joi.string().description('ID of the session associated with the achievement')
    })
  },
  description: 'Gets an achievement by session ID'
},
  handler: function (request, h) {
    try{
      let ach = await request.server.methods.achievement.getAchievementBySession(request.params.id)
      if (!ach) {
        log.error({ err: 'not found', achievement: filter }, 'achievement not found')
        return Boom.notFound('achievement not found')
      }
      return h.response(render(ach))
    }catch(err){
      log.error({ err: err, achievement: filter }, 'error getting achievement')
      return Boom.internal('error getting achievement')
    }
  },
}
