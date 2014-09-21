var mongoose = require('mongoose');

var redeemCodeSchema = new mongoose.Schema({
  code: String,
  achievement: String,
  entries: { type: Number, default: 1 },
  created: { type: Date, default: Date.now },
  duedate: Date,
});

redeemCodeSchema.statics.find = function (query, cb) {
  this.find(query, cb);
};

redeemCodeSchema.statics.del = function (query, cb) {
  this.remove(query, cb);
};


var RedeemCode = module.exports = mongoose.model('RedeemCode', redeemCodeSchema);