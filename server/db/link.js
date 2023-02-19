const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  author: String,
  company: String,
  edition: String,
  attendee: String,
  created: Date,
  updated: Date,
  user: String,
  notes: {
    contacts: { email: String, phone: String },
    interestedIn: String,
    degree: String,
    availability: String,
    otherObservations: String,
    internships: String
  }
})

// Makes pair unique
schema.index({ 'company': 1, 'edition': 1, 'attendee': 1, 'author': 1 }, { 'unique': true })

module.exports = mongoose.model('Link', schema)
