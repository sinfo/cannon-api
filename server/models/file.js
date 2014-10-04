var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  kind: String,
  extension: String,
  created: Date,
  updated: Date
});

schema.statics.findAll = function (cb) {
  this.find({}, cb);
};


schema.statics.findById = function (id, cb) {
  this.find({id: id}, cb);
};

schema.statics.findByName = function (name, cb) {
  this.find({name: name}, cb);
};

schema.statics.findByKind = function (kind, cb) {
  this.find({kind: kind}, cb);
};

schema.statics.findByExtension = function (extension, cb) {
  this.find({extension: extension}, cb);
};

schema.statics.del = function (id, cb) {
  this.remove({id: id}, cb);
};

var File = module.exports = mongoose.model('File', schema);