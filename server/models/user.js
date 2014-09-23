var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  id: {type: String, unique: true},
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

userSchema.statics.find = function (query, cb) {
  this.find(query, cb);
};

userSchema.statics.del = function (query, cb) {
  this.remove(query, cb);
};

var User = module.exports = mongoose.model('User', userSchema);