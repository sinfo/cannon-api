var mongoose = require('mongoose');

var achievementSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  group: String,
  event: String,
  name: String,
  description: String,
  instructions: String,
  img: String,
  points: Number,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

achievementSchema.statics.find = function (query, cb) {
  this.find(query, cb);
};

achievementSchema.statics.del = function (query, cb) {
  this.remove(query, cb);
};


var Achievement = module.exports = mongoose.model('Achievement', achievementSchema);