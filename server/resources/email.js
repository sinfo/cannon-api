const config = require('../../config')
const Boom = require('@hapi/boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const path = require('path')
const Handlebars = require('handlebars')
const fs = require('fs')
const mailgun = require('mailgun-js')(
  {
    apiKey: config.mailgun.apiKey,
    domain: config.mailgun.domain
  }
)

server.method('email.send', send, {})

function send (mailOptions) {
  log.debug({ mailOptions }, 'sending email')

  let data = {
    from: config.email.from,
    to: mailOptions.to,
    subject: mailOptions.subject
  }

  fs.readFile(path.join(__dirname, '/../helpers/ticketEmail.html'), 'utf8', (err, ticketTemplateSource) => {
    if (err) {
      log.error({ err }, 'Error reading email template. Mails not sent')
      throw Boom.internal(err)
    }

    const surveyTemplate = Handlebars.compile(ticketTemplateSource)
    const context = {
      name: mailOptions.name,
      workshopsUrl: `${config.webapp.url}/workshops`,
      body: mailOptions.body
    }
    const surveyHtml = surveyTemplate(context)
    data.html = surveyHtml

    mailgun.messages().send(data, (err, body) => {
      if (err) {
        log.error({ err }, 'error sending email')
        throw Boom.internal(err)
      }
      log.info('email sent to', mailOptions.name)
      return body
    })
  })
}
