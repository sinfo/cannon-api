var pack = require('package');
var fs = require('fs');

var config = {
  url: process.env.CANNON_URL || 'http://localhost:8090',
  host: process.env.CANNON_HOST || 'localhost',
  port: process.env.CANNON_PORT || 8090,
};

config.webapp = {
  url: process.env.CANNON_WEBAPP_URL || 'https://app.sinfo.org'
};

config.upload = {
  path: process.env.CANNON_UPLOAD_PATH || __dirname + '/cannon_uploads',
  maxSize: process.env.CANNON_UPLOAD_MAX_SIZE || 1000*1000
};

config.mongo = {
  url: process.env.CANNON_MONGO_URL || 'mongodb://localhost/cannon'
};

config.facebook = {
  cookie: process.env.CANNON_COOKIE_NAME || 'cannon_cookie',
  password: process.env.CANNON_COOKIE_PASSWORD || 'YOUR COOKIE PASSWORD',
  clientId: process.env.CANNON_FACEBOOK_APP_ID || 'YOUR APP ID',
  clientSecret: process.env.CANNON_FACEBOOK_APP_SECRET || 'YOUR APP SECRET',
};

config.google = {
  clientId: process.env.CANNON_GOOGLE_APP_ID || 'YOUR APP ID',
  clientSecret: process.env.CANNON_GOOGLE_API_KEY || 'YOUR API KEY'
};

config.fenix = {
  url: process.env.CANNON_FENIX_URL || 'https://fenix.tecnico.ulisboa.pt/api/fenix/v1/',
  oauthUrl: process.env.CANNON_FENIX_OAUTH_URL || 'https://fenix.tecnico.ulisboa.pt/oauth/',
  clientId: process.env.CANNON_FENIX_APP_ID || 'YOUR CLIENT_ID',
  clientSecret: process.env.CANNON_FENIX_APP_SECRET || 'YOUR CLIENT_SECRET',
  redirectUri: process.env.CANNON_FENIX_REDIRECT_URI || 'http://example.com/redirect'
};

config.bunyan = {
  name: pack.name,
  level: process.env.CANNON_LOG_LEVEL || 'trace'
};

config.logs = {
  path: process.env.CANNON_LOG_PATH || __dirname + '/tmp/logs/',
};

config.swagger = {
  pathPrefixSize: 1,
  apiVersion: pack.version,
  basePath: config.url,
};

//order lesser permissions to greater
config.auth = {
  permissions: ['user', 'admin']
};

config.auth.paths = {
  tokenKeys: {
    pub: process.env.CANNON_TOKEN_PUBLIC_KEY || __dirname + '/keys/token.pub',
    priv: process.env.CANNON_TOKEN_PRIVATE_KEY || __dirname + '/keys/token.key'
  }
};

config.auth.paths.refreshKeys = {
  pub: process.env.CANNON_REFRESH_TOKEN_PUBLIC_KEY || config.auth.paths.tokenKeys.pub,
  priv: process.env.CANNON_REFRESH_TOKEN_PRIVATE_KEY || config.auth.paths.tokenKeys.priv
};

config.auth.token = {
  ttl: process.env.CANNON_TOKEN_EXPIRATION || 120, //in minutes
  privateKey:  fs.readFileSync(config.auth.paths.tokenKeys.priv),
  publicKey: fs.readFileSync(config.auth.paths.tokenKeys.pub),
  algorithm: process.env.CANNON_TOKEN_ALGORITHM || 'RS256',
  issuer: process.env.CANNON_TOKEN_ISSUER || 'cannon_masters',
  audience: process.env.CANNON_TOKEN_AUDIENCE || 'audience'
};

config.auth.refreshToken = {
  ttl: process.env.CANNON_REFRESH_TOKEN_EXPIRATION || 43200, //in minutes
  privateKey:  fs.readFileSync(config.auth.paths.refreshKeys.priv),
  publicKey: fs.readFileSync(config.auth.paths.refreshKeys.pub),
  algorithm: process.env.CANNON_REFRESH_TOKEN_ALGORITHM || config.auth.token.algorithm,
  issuer: process.env.CANNON_REFRESH_TOKEN_ISSUER || config.auth.token.issuer,
  audience: process.env.CANNON_REFRESH_TOKEN_AUDIENCE || config.auth.token.audience
};


module.exports = config;