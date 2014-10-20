var config = {
  url: process.env.CANNON_URL || 'http://localhost:8080',
  port: process.env.CANNON_PORT || 8080,
};

config.upload = {
  path: process.env.CANNON_UPLOAD_PATH || 'root/cannon_uploads'
};

config.mongo = {
  url: process.env.CANNON_MONGO_URL || 'mongodb://localhost/cannon'
};

config.facebook = {
  cookie: process.env.CANNON_COOKIE_NAME || 'cannon cookie',
  password: process.env.CANNON_COOKIE_PASSWORD || 'YOUR COOKIE PASSWORD',
  clientId: process.env.CANNON_FACEBOOK_APP_ID || 'YOUR APP ID',
  clientSecret: process.env.CANNON_FACEBOOK_APP_SECRET || 'YOUR APP SECRET',
};

config.bunyan = {
  name: require('./package.json').name,
  level: process.env.CANNON_LOG_LEVEL || 'trace'
};

config.logs = {
  path: process.env.CANNON_LOG_PATH || '/tmp/logs/',
};

config.token = {
  expiration: process.env.CANNON_TOKEN_EXPIRATION || 2,
};


module.exports = config;