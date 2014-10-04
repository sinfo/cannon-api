var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {type: String, unique: true},
  event: String,
  category: String,
  name: String,
  description: String,
  instructions: String,
  img: String,
  value: Number,
  created: Date,
  updated: Date
});

schema.statics.findAll = function (cb) {
  this.find({}, cb);
};

schema.statics.findById = function (id, cb) {
  this.findOne({id: id}, cb);
};

schema.statics.findByCategory = function (category, cb) {
  this.find({category: category}, cb);
};

schema.statics.findByEvent = function (event, cb) {
  this.find({event: event}, cb);
};

schema.statics.del = function (id, cb) {
  this.remove({id: id}, cb);
};

var Achievement = module.exports = mongoose.model('Achievement', schema);