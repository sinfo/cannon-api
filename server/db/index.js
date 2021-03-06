const mongoose = require('mongoose')
const mongoUrl = require('../../config').mongo.url
const log = require('../helpers/logger')

mongoose.connect(mongoUrl)
const db = mongoose.connection

db.on('error', function (err) {
  log.error('Connection error:', err)
})

db.once('open', function () {
  log.info('Successfuly connected to mongoDB')
})

module.exports = db
