var mongoose = require('mongoose');

var redeemCodeSchema = new mongoose.Schema({
  code: String,
  achievement: String,
  entries: Number,
  created: { type: Date, default: Date.now },
  duedate: Date,
});