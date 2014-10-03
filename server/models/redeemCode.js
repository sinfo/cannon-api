var mongoose = require('mongoose');

var redeemCodeSchema = new mongoose.Schema({
  id: String,
  achievement: String,
  entries: { type: Number, default: 1 },
  created: Date,
  expires: Date
});

redeemCodeSchema.statics.findAll = function (id, cb) {
  this.find({}, cb);
};


redeemCodeSchema.statics.findById = function (id, cb) {
  this.find({id: id}, cb);
};

redeemCodeSchema.statics.findAll = function (cb) {
  this.find({}, cb);
};


redeemCodeSchema.statics.del = function (id, cb) {
  this.remove({id: id}, cb);
};

var RedeemCode = module.exports = mongoose.model('RedeemCode', redeemCodeSchema);