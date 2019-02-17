const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  id: { type: String, unique: true },
  achievement: String,
  created: Date,
  expires: Date
})

module.exports = mongoose.model('RedeemCode', schema)
