var Boom = require('boom');
var config = require('config');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

var options = {
  path: config.email.path
};

var transporter = nodemailer.createTransport(sendmailTransport(options));

server.method('email.send', send, {});

function send(mailOptions, cb) {
  log.debug({mailOptions: mailOptions}, 'sending email');

  mailOptions.from = mailOptions.from || config.email.from;

  transporter.sendMail(mailOptions, function(err, info){
    if(err){
      log.error({mailOptions: mailOptions, info: info}, 'error sending email');
      return cb && cb();
    }

    log.debug({mailOptions: mailOptions, info: info}, 'sending email');

    cb && cb();
  });
}