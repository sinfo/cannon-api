var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  kind: String,
  extension: String,
  created: Date,
  updated: Date
});

fileSchema.statics.findAll = function (cb) {
  this.find({}, cb);
};


fileSchema.statics.findById = function (id, cb) {
  this.find({id: id}, cb);
};

fileSchema.statics.findByName = function (name, cb) {
  this.find({name: name}, cb);
};

fileSchema.statics.findByKind = function (kind, cb) {
  this.find({kind: kind}, cb);
};

fileSchema.statics.findByExtension = function (extension, cb) {
  this.find({extension: extension}, cb);
};

fileSchema.statics.del = function (id, cb) {
  this.remove({id: id}, cb);
};

var File = module.exports = mongoose.model('File', fileSchema);