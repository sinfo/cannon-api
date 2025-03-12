const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  company: String,
  edition: String,
  kind: String,
  url: String
})

schema.index({ 'company': 1, 'edition': 1, 'kind': 1 }, { 'unique': true })

module.exports = mongoose.model('Url', schema)

