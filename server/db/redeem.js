const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  id: { type: String, unique: true },
  achievement: String,
  user: String,
  // entries: { type: Number, default: 1 },
  created: Date,
  expires: Date
})

module.exports = mongoose.model('RedeemCode', schema)
