var mongoose = require('mongoose');

var achievementSchema = new mongoose.Schema({
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

achievementSchema.statics.findById = function (id, cb) {
  this.find({id: id}, cb);
};

achievementSchema.statics.findByCategory = function (category, cb) {
  this.find({category: category}, cb);
};

achievementSchema.statics.findByEvent = function (event, cb) {
  this.find({event: event}, cb);
};

achievementSchema.statics.del = function (id, cb) {
  this.remove({id: id}, cb);
};

var Achievement = module.exports = mongoose.model('Achievement', achievementSchema);