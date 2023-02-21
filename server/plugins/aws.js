const aws = require('@aws-sdk/client-s3')
const path = require('path')
const config = require(path.join(__dirname, '..', '..', 'config'))
const mime = require('mime-types')
const log = require('../helpers/logger')

const s3Client = new aws.S3Client({
  endpoint: `https://${config.aws.storageRegion}.${config.aws.storageDomain}`,
  forcePathStyle: false,
  region: config.aws.storageRegion,
  credentials: {
    accessKeyId: config.aws.storageKey,
    secretAccessKey: config.aws.storageSecret
  }
})

module.exports.download = async (path, filename) => {
  const params = {
    Bucket: config.aws.storageName,
    Key: path + filename
  }

  try {
    await s3Client.send(new aws.GetObjectCommand(params))
  } catch(err) {
    log.error({ error: err })
  }
}

module.exports.upload = async (path, buffer, filename, isPublic) => {
  const params = {
    Bucket: config.aws.storageName,
    Key: path + filename,
    Body: buffer,
    ACL: isPublic !== undefined && isPublic ? 'public-read' : 'authenticated-read',
    ContentType: mime.lookup(filename)
  }

  try {
    await s3Client.send(new aws.PutObjectCommand(params))
    return `https://${config.aws.storageName}.${config.aws.storageRegion}.${config.aws.storageDomain}/${path}${filename}`
  } catch(err) {
    log.error({ error: err })
  }
}

module.exports.delete = async (path, filename) => {
  const params = {
    Bucket: config.aws.storageName,
    Key: path + filename
  }

  try {
    await s3Client.send(new aws.DeleteObjectCommand(params))
  } catch(err) {
    log.error({ error: err })
  }
}