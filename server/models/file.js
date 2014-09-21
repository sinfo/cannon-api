var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  kind: String,
  extension: String,
  user: String,
  date: { type: Date, default: Date.now }
});

fileSchema.statics.find = function (query, cb) {
  this.find(query, cb);
};

fileSchema.statics.del = function (query, cb) {
  this.remove(query, cb);
};


var File = module.exports = mongoose.model('File', fileSchema);