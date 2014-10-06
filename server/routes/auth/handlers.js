var log = require('server/helpers/logger');

var handlers = module.exports;

exports.facebook = {
  auth: {
    strategies: ['default', 'facebook'],
    mode: 'optional'
  },
  pre: [
    { method: 'auth.facebook(auth)', assign: 'facebook' }
  ],
  handler: function (request, reply) {
     reply(request.pre.facebook).redirect('/');
  },
  description: 'Facebook login'
};