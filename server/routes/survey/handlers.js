var Joi = require('joi');
var qr = require('qr-image');
var log = require('server/helpers/logger');
var config = require('config');

var handlers = module.exports;

exports.sumbit = {
  tags: ['api','survey'],
  auth: false,
  validate: {
    params: {
      redeemCode: Joi.string().required().description('redeem code'),
    }
  },
  pre: [
    { method: 'redeem.get(params.redeemCode)', assign: 'redeem' },
    { method: 'achievement.get(pre.redeemCode.achievement)', assign: 'achievement' },
    // { method: 'survey.submit(pre.achievement.session, payload)', assign: 'survey' },
  ],
  handler: function (request, reply) {
    reply({success: true});
  },
  description: 'Submit a survey'
};

module.exports = handlers;
