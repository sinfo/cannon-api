var Request = require('request')
var log = require('server/helpers/logger')
var facebookConfig = require('config').facebook

var facebook = {}

facebook.debugToken = function (facebookUserId, facebookUserToken, cb) {
  var url = 'https://graph.facebook.com/debug_token?input_token=' + facebookUserToken + '&access_token=' + facebookConfig.clientId + '|' + facebookConfig.clientSecret

  Request.get(url, {
    json: true
  },
  function (error, response, result) {
    if (error || response.statusCode !== 200) {
      log.warn({err: error, facebookConfig: facebookConfig, response: response})
      return cb(error || {err: response.statusCode, message: response.statusMessage})
    }

    var isValid = !(!result.data || result.data.app_id !== facebookConfig.clientId || result.data.user_id !== facebookUserId)

    if (!isValid) {
      log.warn(
        {
          'result-app-id': result.data.app_id,
          'config-app-id': facebookConfig.clientId,
          'result-user-id': result.data.user_id,
          'requested-user-id': facebookUserId
        },
        'invalid facebook login!'
      )
    }

    cb(null, isValid)
  })
}

facebook.getMe = function (accessToken, cb) {
  var url = 'https://graph.facebook.com/me?access_token=' + accessToken
  Request.get(url, {
    json: true
  },
  function (error, response, result) {
    if (error || response.statusCode !== 200) {
      return cb(error || {err: response.statusCode, message: response.statusMessage})
    }

    cb(null, result)
  })
}

module.exports = facebook
