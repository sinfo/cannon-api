var mongoose = require('mongoose');

var redeemCodeSchema = new mongoose.Schema({
  id: String,
  achievement: String,
  entries: { type: Number, default: 1 },
  created: Date,
  expires: Date
});

var RedeemCode = module.exports = mongoose.model('RedeemCode', redeemCodeSchema);