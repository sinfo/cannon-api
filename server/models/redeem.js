var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: String,
  achievement: String,
  entries: { type: Number, default: 1 },
  created: Date,
  expires: Date
});

schema.statics.findAll = function (id, cb) {
  this.find({}, cb);
};


schema.statics.findById = function (id, cb) {
  this.find({id: id}, cb);
};

schema.statics.findAll = function (cb) {
  this.find({}, cb);
};


schema.statics.del = function (id, cb) {
  this.remove({id: id}, cb);
};

var RedeemCode = module.exports = mongoose.model('RedeemCode', schema);