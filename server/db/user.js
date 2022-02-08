const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  img: String,
  role: { type: String, default: 'user' },
  mail: { type: String, unique: true, sparse: true },
  bearer: [{
    token: { type: String, unique: true, sparse: true },
    refreshToken: { type: String, unique: true, sparse: true },
    ttl: Number,
    date: Date
  }],
  signatures: [{
    day: String,
    edition: String,
    redeemed: { type: Boolean, default: false },
    signatures: [{
      companyId: String,
      date: Date
    }]
  }],
  company: [{
    edition: String,
    company: String
  }],
  facebook: {
    id: String
  },
  linkedin: {
    id: String
  },
  google: {
    id: String
  },
  fenix: {
    id: String
  },
  area: String,
  skills: Array,
  job: {
    startup: Boolean,
    internship: Boolean,
    start: Date
  },
  registered: Date,
  updated: Date
})

module.exports = mongoose.model('User', schema)
