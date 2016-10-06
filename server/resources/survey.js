var Boom = require('boom')
var server = require('../').hapi
var log = require('../helpers/logger')
var Survey = require('../db/survey')

server.method('survey.submit', submit, {})
server.method('survey.get', get, {})
server.method('survey.processResponses', processResponses, {})

function submit (sessionId, response, cb) {
  var changes = {
    $push: {
      responses: response
    },
    // If survey does not exist, lets set the sessionId
    $setOnInsert: {
      session: sessionId
    }
  }

  Survey.findOneAndUpdate({ session: sessionId }, changes, {upsert: true}, function (err, _survey) {
    if (err) {
      log.error({err: err, session: sessionId}, 'error updating survey')
      return cb(Boom.internal())
    }

    cb(null, _survey)
  })
}

function get (sessionId, cb) {
  Survey.findOne({ session: sessionId }, function (err, _survey) {
    if (err) {
      log.error({err: err, session: sessionId}, 'error getting survey')
      return cb(Boom.internal())
    }
    if (!_survey) {
      log.error({err: 'not found', session: sessionId}, 'error getting survey')
      return cb(Boom.notFound('survey not found'))
    }

    cb(null, _survey)
  })
}

function processResponses (survey, cb) {
  var processed = {
    responses: 0,
    age: {},
    gender: {},
    area: {},
    isIST: 0,
    satisfaction: {},
    logistics: {
      instalations: {},
      location: {},
      organization: {},
      communication: {}
    },
    session: {
      organization: {},
      content: {},
      speaker: {},
      duration: {},
      recommend: {}
    },
    suggestions: []
  }

  survey.responses.forEach(function (response) {
    processed.responses++

    processed.age[response.age] = processed.age[response.age] && processed.age[response.age] + 1 || 1
    processed.gender[response.gender] = processed.gender[response.gender] && processed.gender[response.gender] + 1 || 1
    if (response.area !== 'Other') {
      processed.area[response.area] = processed.area[response.area] && processed.area[response.area] + 1 || 1
    }
    if (response.areaOther !== '') {
      processed.area[response.areaOther] = processed.area[response.areaOther] && processed.area[response.areaOther] + 1 || 1
    }
    if (response.isIST) {
      processed.isIST = processed.isIST && processed.isIST + 1 || 1
    }

    if (response.satisfaction) {
      processed.satisfaction[response.satisfaction] = processed.satisfaction[response.satisfaction] && processed.satisfaction[response.satisfaction] + 1 || 1
    }

    if (response.logistics.instalations) {
      processed.logistics.instalations[response.logistics.instalations] = processed.logistics.instalations[response.logistics.instalations] && processed.logistics.instalations[response.logistics.instalations] + 1 || 1
    }

    if (response.logistics.location) {
      processed.logistics.location[response.logistics.location] = processed.logistics.location[response.logistics.location] && processed.logistics.location[response.logistics.location] + 1 || 1
    }

    if (response.logistics.organization) {
      processed.logistics.organization[response.logistics.organization] = processed.logistics.organization[response.logistics.organization] && processed.logistics.organization[response.logistics.organization] + 1 || 1
    }

    if (response.logistics.communication) {
      processed.logistics.communication[response.logistics.communication] = processed.logistics.communication[response.logistics.communication] && processed.logistics.communication[response.logistics.communication] + 1 || 1
    }

    if (response.session.organization) {
      processed.session.organization[response.session.organization] = processed.session.organization[response.session.organization] && processed.session.organization[response.session.organization] + 1 || 1
    }

    if (response.session.content) {
      processed.session.content[response.session.content] = processed.session.content[response.session.content] && processed.session.content[response.session.content] + 1 || 1
    }

    if (response.session.speaker) {
      processed.session.speaker[response.session.speaker] = processed.session.speaker[response.session.speaker] && processed.session.speaker[response.session.speaker] + 1 || 1
    }

    if (response.session.duration) {
      processed.session.duration[response.session.duration] = processed.session.duration[response.session.duration] && processed.session.duration[response.session.duration] + 1 || 1
    }

    if (response.session.recommend) {
      processed.session.recommend[response.session.recommend] = processed.session.recommend[response.session.recommend] && processed.session.recommend[response.session.recommend] + 1 || 1
    }

    if (response.suggestions !== '') {
      processed.suggestions.push(response.suggestions)
    }
  })

  cb(processed)
}
