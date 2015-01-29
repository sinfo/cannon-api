var pack = require('package');
var fs = require('fs');

var config = {
  url: process.env.EVENTAPP_URL || 'http://localhost:8090',
  port: process.env.EVENTAPP_PORT || 8090,
};

config.upload = {
  path: process.env.EVENTAPP_UPLOAD_PATH || 'root/cannon_uploads'
};

config.mongo = {
  url: process.env.EVENTAPP_MONGO_URL || 'mongodb://localhost/eventapp'
};

config.facebook = {
  cookie: process.env.EVENTAPP_COOKIE_NAME || 'eventapp cookie',
  password: process.env.EVENTAPP_COOKIE_PASSWORD || 'YOUR COOKIE PASSWORD',
  clientId: process.env.EVENTAPP_FACEBOOK_APP_ID || 'YOUR APP ID',
  clientSecret: process.env.EVENTAPP_FACEBOOK_APP_SECRET || 'YOUR APP SECRET',
};

config.bunyan = {
  name: pack.name,
  level: process.env.EVENTAPP_LOG_LEVEL || 'trace'
};

config.logs = {
  path: process.env.EVENTAPP_LOG_PATH || '/tmp/logs/',
};

config.swagger = {
  pathPrefixSize: 2,
  apiVersion: pack.version,
  basePath: config.url,
};

config.token = {
  expiration: process.env.EVENTAPP_TOKEN_EXPIRATION || 10,
  privateKey:  fs.readFileSync(process.env.EVENTAPP_TOKEN_PRIVATE_KEY || './keys/token'),
  publicKey: fs.readFileSync(process.env.EVENTAPP_TOKEN_PUBLIC_KEY || './keys/token.pub'),
  algorithm: process.env.EVENTAPP_TOKEN_ALGORITHM || 'RS256',
  issuer: process.env.EVENTAPP_TOKEN_ISSUER || 'eventapp masters',
  audience: process.env.EVENTAPP_TOKEN_AUDIENCE || 'audience'
};


module.exports = config;