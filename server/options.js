const auth = require('./auth')

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
      allowQueryToken: true,
      allowMultipleHeaders: true,
      accessTokenName: 'access_token',
      validate: auth.bearer
    },
    internal: {
      allowEmptyUsername: false,
      validate: auth.internal
    }
  },
  upload: [
    { kind: 'cv', mimes: ['application/pdf'] }
  ],
  cv: {
    expiration: 60 // days
  }
}
