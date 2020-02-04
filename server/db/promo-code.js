const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  company: String,
  edition: String,
  expire: Date,
  description: String,
  code: String
})

schema.index({ 'company': 1, 'edition': 1, 'code': 1 }, {'unique': true})

module.exports = mongoose.model('promocode', schema)
