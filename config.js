const pack = require('./package')
const fs = require('fs')
const join = require('path').join

const config = {
  url: process.env.CANNON_URL || 'http://localhost:8090',
  host: process.env.CANNON_HOST || 'localhost',
  port: process.env.CANNON_PORT || 8090
}

config.webapp = {
  url: process.env.CANNON_WEBAPP_URL || 'https://app.sinfo.org'
}

config.deck = {
  url: process.env.EVENTDECK_URL || 'https://deck.sinfo.org'
}

config.upload = {
  path: process.env.CANNON_UPLOAD_PATH || join(__dirname, '/cannon_uploads'),
  maxSize: process.env.CANNON_UPLOAD_MAX_SIZE || 1000 * 1000
}

config.mongo = {
  url: process.env.CANNON_MONGO_URL || 'mongodb://localhost/cannon'
}

config.facebook = {
  cookie: process.env.CANNON_COOKIE_NAME || 'cannon_cookie',
  password: process.env.CANNON_COOKIE_PASSWORD || 'YOUR COOKIE PASSWORD',
  clientId: process.env.CANNON_FACEBOOK_APP_ID || 'YOUR APP ID',
  clientSecret: process.env.CANNON_FACEBOOK_APP_SECRET || 'YOUR APP SECRET'
}

config.google = {
  clientId: process.env.CANNON_GOOGLE_APP_ID || 'YOUR APP ID',
  clientSecret: process.env.CANNON_GOOGLE_CLIENT_SECRET || 'YOUR CLIENT SECRET',
  apiKey: process.env.CANNON_GOOGLE_API_KEY || 'YOUR API KEY'
}

config.fenix = {
  url: process.env.CANNON_FENIX_URL || 'https://fenix.tecnico.ulisboa.pt/api/fenix/v1/',
  oauthUrl: process.env.CANNON_FENIX_OAUTH_URL || 'https://fenix.tecnico.ulisboa.pt/oauth/',
  clientId: process.env.CANNON_FENIX_APP_ID || 'YOUR CLIENT_ID',
  clientSecret: process.env.CANNON_FENIX_APP_SECRET || 'YOUR CLIENT_SECRET',
  redirectUri: process.env.CANNON_FENIX_REDIRECT_URI || 'http://example.com/redirect'
}

config.bunyan = {
  name: pack.name,
  level: process.env.CANNON_LOG_LEVEL || 'trace'
}

config.logs = {
  path: process.env.CANNON_LOG_PATH || join(__dirname, '/tmp/logs/')
}

config.swagger = {
  pathPrefixSize: 1,
  apiVersion: pack.version,
  basePath: config.url
}

// order lesser permissions to greater
config.auth = {
  permissions: ['user', 'company', 'team', 'admin']
}

config.auth.paths = {
  tokenKeys: {
    pub: process.env.CANNON_TOKEN_PUBLIC_KEY || join(__dirname, '/keys/token.pub'),
    priv: process.env.CANNON_TOKEN_PRIVATE_KEY || join(__dirname, '/keys/token.key')
  }
}

config.auth.paths.refreshKeys = {
  pub: process.env.CANNON_REFRESH_TOKEN_PUBLIC_KEY || config.auth.paths.tokenKeys.pub,
  priv: process.env.CANNON_REFRESH_TOKEN_PRIVATE_KEY || config.auth.paths.tokenKeys.priv
}

config.auth.token = {
  ttl: process.env.CANNON_TOKEN_EXPIRATION || 120, // in minutes
  privateKey: fs.readFileSync(config.auth.paths.tokenKeys.priv),
  publicKey: fs.readFileSync(config.auth.paths.tokenKeys.pub),
  algorithm: process.env.CANNON_TOKEN_ALGORITHM || 'RS256',
  issuer: process.env.CANNON_TOKEN_ISSUER || 'cannon_masters',
  audience: process.env.CANNON_TOKEN_AUDIENCE || 'audience'
}

config.auth.refreshToken = {
  ttl: process.env.CANNON_REFRESH_TOKEN_EXPIRATION || 43200, // in minutes
  privateKey: fs.readFileSync(config.auth.paths.refreshKeys.priv),
  publicKey: fs.readFileSync(config.auth.paths.refreshKeys.pub),
  algorithm: process.env.CANNON_REFRESH_TOKEN_ALGORITHM || config.auth.token.algorithm,
  issuer: process.env.CANNON_REFRESH_TOKEN_ISSUER || config.auth.token.issuer,
  audience: process.env.CANNON_REFRESH_TOKEN_AUDIENCE || config.auth.token.audience
}

config.auth.internal = {
  username: process.env.CANNON_INTERNAL_AUTH_USERNAME || 'YOUR INTERNAL AUTH USERNAME',
  password: process.env.CANNON_INTERNAL_AUTH_PASSWORD || 'YOUR INTERNAL AUTH PASSWORD'
}

config.email = {
  from: process.env.CANNON_EMAIL_FROM || 'SINFO <geral@sinfo.org>',
  replyTo: process.env.CANNON_EMAIL_REPLY_TO || 'geral@sinfo.org',
  path: process.env.CANNON_EMAIL_PATH || '/usr/sbin/sendmail'
}

config.mailgun = {
  apiKey: process.env.MAILGUN_APIKEY || 'YOUR API KEY',
  domain: process.env.MAILGUN_DOMAIN || 'sinfo.org'
}

if (process.env.NODE_ENV === 'test') {
  config.mongo.url = process.env.CANNON_MONGO_TEST_URL || 'mongodb://localhost/cannon_test'
  config.bunyan.level = process.env.CANNON_LOG_LEVEL_TEST || 'error'
}

module.exports = config
