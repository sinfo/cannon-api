const aws = require('aws-sdk')
const path = require('path')
const config = require(path.join(__dirname, '..', '..', 'config'))
const mime = require('mime-types')

const AWS_URL = `https://${config.aws.storageRegion}.${config.aws.storageDomain}${path}`

function promiseWrapper(s3, key, params, returnData) {
  return new Promise((resolve, reject) => {
    s3[key](params, (err, data) => {
      if (err) {
        resolve(null)
      }

      resolve(returnData || data)
    })
  })
}

module.exports.download = (path, filename) => {
  let s3 = new aws.S3({
    endpoint: new aws.Endpoint(AWS_URL),
    accessKeyId: config.aws.storageKey,
    secretAccessKey: config.aws.storageSecret
  })

  return promiseWrapper(s3, 'getObject', {
    Bucket: config.aws.storageName,
    Key: filename
  })
}

module.exports.upload = (path, buffer, filename, isPublic) => {
  const s3 = new aws.S3({
    endpoint: new aws.Endpoint(AWS_URL),
    accessKeyId: config.aws.storageKey,
    secretAccessKey: config.aws.storageSecret
  })

  return promiseWrapper(s3, 'putObject', {
    ACL: isPublic !== undefined && isPublic ? 'public-read' : 'authenticated-read',
    Body: buffer,
    Bucket: config.aws.storageName,
    Key: filename,
    ContentType: mime.lookup(filename)
  }, `https://${config.aws.storageName}.${config.aws.storageRegion}.${config.aws.storageDomain}${path}/${filename}`)
}

module.exports.delete = (path, filename) => {
  let s3 = new aws.S3({
    endpoint: new aws.Endpoint(`https://${config.aws.storageRegion}.${config.aws.storageDomain}${path}`),
    accessKeyId: config.aws.storageKey,
    secretAccessKey: config.aws.storageSecret,
  })

  return promiseWrapper(s3, 'deleteObject', {
    Bucket: config.aws.storageName,
    Key: filename
  })
}