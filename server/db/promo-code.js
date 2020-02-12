const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  company: String,
  edition: String,
  expire: Date,
  description: String,
  code: String
})

module.exports = mongoose.model('promocode', schema)
