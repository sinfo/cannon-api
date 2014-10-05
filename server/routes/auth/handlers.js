var log = require('server/helpers/logger');

var handlers = module.exports;

exports.facebook = {
  pre: [
    //{ method: 'auth.facebook(payload)', assign: 'facebook' }
  ],
  handler: function (request, reply) {
    //reply(request.pre.facebook).created('/api/achievement/'+request.pre.achievement.id);
  },
  description: 'Creates a new achievement'
};