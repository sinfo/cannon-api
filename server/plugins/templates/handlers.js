var Joi = require('joi');
var Boom = require('boom');
var log = require('server/helpers/logger');
var config = require('config');
var async = require('async');
var uuid = require('uuid');

var handlers = module.exports;

handlers.grid = {
  auth: false,
  tags: ['api','templates'],
  validate: {
    params: {
      achievementId: Joi.string().required().description('id of the achievement we want'),
    },
    query: {
      quantity: Joi.number().default(10).description('how many redeem codes'),
    }
  },
  pre: [
    {
      method: function (request, reply) {
        request.server.methods.achievement.get(request.params.achievementId, function(err, achievement) {
          return reply(err || achievement);
        });
      },
      assign: 'achievement'
    },
    {
      method: function (request, reply) {
        var redeemCodes = [];
        var count = 0;

        async.whilst(
          function () { return count < request.query.quantity; },
          function (cb) {
            count++;

            var redeemCode = {
              id: uuid.v4(),
              achievement: request.params.achievementId,
            };

            request.server.methods.redeem.create(redeemCode, function(err, redeemCode) {
              if(err) {
                log.error({err: err}, 'error creating redeem code');
                return cb(Boom.internal('error creating redeem code'));
              }

              redeemCode.index = count;
              redeemCodes.push(redeemCode);
              return cb();
            });

          },
          function (err) {
            if(err) {
              return reply(err);
            }

            reply(redeemCodes);
          }
        );
      },
      assign: 'redeemCodes'
    }
  ],
  handler: function (request, reply) {
    reply.view('grid.hbs', {
      achievement: request.pre.achievement,
      redeemCodes: request.pre.redeemCodes,
      redeemUrl: config.url + '/r',
      qrcodeUrl: config.url + '/qrcode',
    });
  },
  description: 'Renders a list of redeem codes for an achievement'
};