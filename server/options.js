
var auth = require('server/auth')

module.exports = {
  log: {
    opsInterval: 1800000,
    subscribers: {
      opsPath: ['ops'],
      logPath: ['request', 'log', 'error']
    }
  },
  auth: {
    default: {
      allowQueryToken: false,
      allowMultipleHeaders: true,
      accessTokenName: 'access_token',
      validateFunc: auth.bearer
    },
    backup: {
      allowEmptyUsername: false,
      validateFunc: auth.basic
    },
    internal: {
      allowEmptyUsername: false,
      validateFunc: auth.internal
    }
  },
  upload: [
    {kind: 'cv', mimes: ['application/pdf']}
  ],
  cv: {
    expiration: 60 // days
  }
}
