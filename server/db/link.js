const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  company: String,
  edition: String,
  attendee: String,
  created: Date,
  updated: Date,
  user: String,
  note: String
})

// Makes pair unique
schema.index({ 'company': 1, 'edition': 1, 'attendee': 1 }, { 'unique': true })

module.exports = mongoose.model('Link', schema)
