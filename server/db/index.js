const mongoose = require('mongoose')
const mongoUrl = require('../../config').mongo.url
const log = require('../helpers/logger')

mongoose.connect(mongoUrl, {connectTimeoutMS: 1000})
const db = mongoose.connection

log.info('Connecting to db...')

db.on('error', function (err) {
  log.error('Connection error:', err)
})

db.once('open', function () {
  log.info('Successfully connected to mongoDB')
})

module.exports = db
