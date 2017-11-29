const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  company: {
    edition: [{
      date: String,
      user: String,
      atendee: String,
      note: String
    }]
  }
})

module.exports = mongoose.model('Link', schema)
