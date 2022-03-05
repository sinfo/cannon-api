/*
    The youtube API restricts the amount of HTTP requests
    we are able to do, per day. Therefore, this
    implementation respects the API limits and allows us
    to periodically check if SINFO is livestreaming.
*/

const google = require('../../helpers/google')
const log = require('../../helpers/logger')
const Boom = require('boom')

// Time between calls
const timeOut = 5 * (60 * 1000)

// The stream information
var liveInfo = {
  up: false,
  url: ''
}

exports = module.exports

exports.getLivestream = {
  options: {tags: ['api', 'google']},
  handler: async (req, h) => {
    h.response(liveInfo)
  }
}

if (process.env.NODE_ENV === 'production') { setTimeout(checkLiveStream, timeOut) }

function checkLiveStream () {
  const now = new Date()

  if (now.getHours() >= 14 && now.getHours() <= 19) {
    google.getLiveStream((result, err) => {
      if (err) return
      liveInfo = result
    })
  }

  setTimeout(checkLiveStream, timeOut)
}
