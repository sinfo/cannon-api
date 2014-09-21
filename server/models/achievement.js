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

achievementSchema.statics.find = function (query, cb) {
  this.find(query, cb);
};

achievementSchema.statics.del = function (query, cb) {
  this.remove(query, cb);
};

var Achievement = module.exports = mongoose.model('Achievement', achievementSchema);