var Joi = require('joi');
var Boom = require('boom');
var log = require('server/helpers/logger');
var config = require('config');
var async = require('async');
var surveyResource = require('server/resources/survey');

var handlers = module.exports;

handlers.surveyResults = {
  auth: false,
  tags: ['api', 'survey'],
  validate: {
    params: {
      sessionId: Joi.string().required().description('id of the session whose surveys we want'),
    }
  },
  pre: [
    {
      method: function (request, reply) {
        request.server.methods.survey.get(request.params.sessionId, function (err, survey) {
          return reply(err || survey);
        });
      },
      assign: 'survey'
    },
    {
      method: function (request, reply) {
        request.server.methods.session.get(request.params.sessionId, function (err, session) {
          return reply(err || session);
        });
      },
      assign: 'session'
    }
  ],
  handler: function (request, reply) {
    reply.view('surveyResults.hbs', {
      survey: request.pre.survey.session,
      session: request.pre.session.name
    });
  },
  description: 'Renders a survey analysis for a session'
};
