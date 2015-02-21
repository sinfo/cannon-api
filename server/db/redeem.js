var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: { type: String, unique: true },
  achievement: String,
  // entries: { type: Number, default: 1 },
  created: Date,
  expires: Date
});

var RedeemCode = module.exports = mongoose.model('RedeemCode', schema);