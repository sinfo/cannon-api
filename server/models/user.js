var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  key: {type: String, unique: true},
  name: String,
  facebook: {
    id: String,
    token: String
  },
  fenix: {
    id: String,
    token: String,
    refreshToken: String
  },
  role: String,
  mail: String,
  points:{
    available: Number,
    total: Number
  },
  achievements: [{
    id: String,
    date: Date
  }]
});

userSchema.statics.findById = function (id, cb) {
  this.find({id: id}, cb);
};

userSchema.statics.findByRole = function (role, cb) {
  this.find({role: role}, cb);
};

userSchema.statics.del = function (id, cb) {
  this.remove({id: id}, cb);
};

var User = module.exports = mongoose.model('User', userSchema);