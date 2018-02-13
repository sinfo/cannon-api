const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const Survey = require('../db/survey')
const config = require('../../config')
const mailgun = require('mailgun-js')(
  {
    apiKey: config.mailgun.apiKey,
    domain: config.mailgun.domain
  }
)

server.method('survey.submit', submit, {})
server.method('survey.sendMail', sendMail, {})
server.method('survey.get', get, {})
server.method('survey.processResponses', processResponses, {})

function submit (sessionId, response, cb) {
  const changes = {
    $push: {
      responses: response
    },
    // If survey does not exist, lets set the sessionId
    $setOnInsert: {
      session: sessionId
    }
  }

  Survey.findOneAndUpdate({ session: sessionId }, changes, {upsert: true}, (err, _survey) => {
    if (err) {
      log.error({err: err, session: sessionId}, 'error updating survey')
      return cb(Boom.internal())
    }

    cb(null, _survey)
  })
}

function sendMail (redeemCodes, users, session, cb) {
  let to = []
  let recipientVars = {}

  users.forEach((user, i) => {
    recipientVars[user.mail] = {
      name: user.name,
      redeemCodeId: redeemCodes[i].id
    }
    to.push(user.mail)
  })

  console.log('recipientVars', recipientVars)

  const data = {
    from: config.from,
    to,
    subject: `[SINFO] Survey for the session ${session.name}`,
    'recipient-variables': recipientVars,
    html: `<p>Hello %recipient.name%,</p>
          <br />
          <p>You have just checked in for the session ${session.name}</p>
          <p>To become eligible to win a prize at the end of the session, you need to submit the following survey: ${config.url}/r/%recipient.redeemCodeId%</p>`
  }

  mailgun.messages().send(data, (err, body) => {
    if (err) {
      console.log(err)
      return cb(err)
    }
    cb(body)
  })
}

function get (sessionId, cb) {
  Survey.findOne({ session: sessionId }, (err, _survey) => {
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
  const processed = {
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

  survey.responses.forEach((response) => {
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
