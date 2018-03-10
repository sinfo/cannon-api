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

module.exports = mongoose.model('Endpoint', schema)
