const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  company: String,
  edition: String,
  validity: {
    from: Date,
    to: Date
  },
  description: String,
  code: String
})

module.exports = mongoose.model('promocode', schema)
