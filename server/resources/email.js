const config = require('../../config')
const server = require('../').hapi
const log = require('../helpers/logger')
const nodemailer = require('nodemailer')
const sendmailTransport = require('nodemailer-sendmail-transport')

const options = {
  path: config.email.path
}

const transporter = nodemailer.createTransport(sendmailTransport(options))

server.method('email.send', send, {})

function send (mailOptions, cb) {
  log.debug({mailOptions: mailOptions}, 'sending email')

  mailOptions.from = mailOptions.from || config.email.from
  mailOptions.replyTo = mailOptions.replyTo || config.email.replyTo
  mailOptions.text = formatText(mailOptions.text)

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      log.error({mailOptions: mailOptions, info: info}, 'error sending email')
      return cb && cb()
    }

    log.debug({mailOptions: mailOptions, info: info}, 'sending email')

    cb && cb()
  })
}

function formatText (text) {
  const header = 'BOOOMMM!!\n\n'
  const footer = '\n\nSuch <3,\n\n' +
                '\xA0\xA0\xA0_||SINFOOOOOOO\n' +
                '_|   |__\n' +
                '\\oooooo/'
  return header + text + footer
}
