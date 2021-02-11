const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  company: String,
  edition: String,
  visited: Number,
  validaty: {
    from: Date,
    to: Date
  },
  created: Date,
  updated: Date
})

schema.index({ 'company': 1, 'edition': 1 }, { 'unique': true })

module.exports = mongoose.model('Endpoint', schema)
