const Boom = require('boom')
const Mime = require('mime')
const config = require('../../config')
const options = require('../options')
const server = require('../').hapi
const log = require('../helpers/logger')
const async = require('async')
const fs = require('fs')
const urlencode = require('urlencode')
const fieldsParser = require('../helpers/fieldsParser')
const File = require('../db/file')
const Zip = require('adm-zip')

server.method('file.create', create, {})
server.method('file.createArray', createArray, {})
server.method('file.update', update, {})
server.method('file.get', get, {})
server.method('file.list', list, {})
server.method('file.remove', remove, {})
server.method('file.removeFromUser', removeFromUser, {})
server.method('file.delete', deleteFile, {})
server.method('file.saveFiles', saveFiles, {})
server.method('file.upload', upload, {})
server.method('file.uploadCV', uploadCV, {})
server.method('file.zipFiles', zipFiles, {})

function createArray (files, cb) {
  if (!files.length) {
    return create(files, cb)
  }
  async.map(files, create, (err, results) => {
    if (err) {
      log.error({err: err, files: files}, '[files] error creating files in db')
    }
    cb(err, results)
  })
}

function create (file, user, cb) {
  file.user = (cb && user) || file.user
  cb = cb || user

  file.created = file.updated = Date.now()

  File.create(file, (err, _file) => {
    if (err) {
      if (err.code === 11000) {
        return cb(Boom.conflict('file is a duplicate'))
      }

      log.error({err: err, file: file.id}, 'error creating file')
      return cb(Boom.internal())
    }
    cb(null, _file.toObject({ getters: true }))
  })
}

function update (id, file, user, query, cb) {
  cb = cb || query || user
  query = query || {}
  if (arguments.length === 4) {
    if (typeof user !== 'string') {
      query = user
      user = null
    }
  }

  if (typeof user === 'function') {
    user = null
  }

  const options = {
    upsert: query.upsert
  }

  file.updated = Date.now()
  file.$setOnInsert = {created: file.updated}
  file.user = user || file.user || null

  File.findOneAndUpdate({id: id}, file, options, (err, _file) => {
    if (err) {
      log.error({err: err, file: id}, 'error updating file')
      return cb(Boom.internal())
    }
    if (!_file) {
      log.error({err: err, file: id}, 'error updating file')
      return cb(Boom.notFound())
    }

    cb(null, _file.toObject({ getters: true }))
  })
}

function get (id, query, cb) {
  cb = cb || query // fields is optional
  if (!id) { // check if file exists use case
    log.warn('[file] tried to get with empty file id')
    return cb()
  }

  const fields = fieldsParser(query.fields)
  const filter = {$or: [{id: id}, {user: id}]}

  File.findOne(filter, fields, (err, file) => {
    if (err) {
      log.error({err: err, file: id}, 'error getting file')
      return cb(Boom.internal())
    }
    if (!file) {
      return cb(Boom.notFound())
    }
    cb(null, file.toObject({ getters: true }))
  })
}

function list (query, cb) {
  cb = cb || query // fields is optional

  const filter = {}
  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  File.find(filter, fields, options, (err, file) => {
    if (err) {
      log.error({err: err}, 'error getting all files')
      return cb(Boom.internal())
    }

    cb(null, file)
  })
}

function remove (id, cb) {
  File.findOneAndRemove({id: id}, (err, file) => {
    log.info('remove', id)
    if (err) {
      log.error({err: err, file: id}, 'error deleting file')
      return cb(Boom.internal())
    }
    if (!file) {
      log.error({err: 'not found', file: id}, 'error deleting file')
      return cb(Boom.notFound())
    }

    deleteFile(file.id, cb)
    return cb(null, file)
  }, { new: false })
}

function removeFromUser (id, cb) {
  File.findOne({ user: id }, (err, file) => {
    if (err) {
      log.error({err: err, user: id}, 'error getting file')
      return cb(Boom.internal())
    }
    if (!file) {
      return cb(Boom.notFound())
    }

    remove(file.id, cb)
  })
}

function uploadCV (data, cb) {
  return upload('cv', data, cb)
}

function upload (kind, data, cb) {
  const files = []
  async.each(Object.keys(data), (prop, cbAsync) => {
    if (data.hasOwnProperty(prop)) {
      files.push(prop)
    }
    cbAsync()
  },
  (err) => {
    if (err) {
      log.error({err: err, kind: kind, files: files}, '[files] error assigning file keys')
      return cb(Boom.internal())
    }
    saveFiles(kind, files, data, cb)
  })
}

function saveFiles (kind, files, data, cb) {
  if (!files) {
    cb(Boom.badData())
  }
  if (files.length === 1) {
    return saveFile(kind, data[files[0]], cb)
  }

  async.map(files, (file, cbAsync) => {
    saveFile(kind, data[file], cbAsync)
  }, cb)
}

function deleteFile (file, cb) {
  // only delete if file defined, doesn't throw err
  if (!file || file === '') {
    log.warn('[file] tried to delete empty file path')
    return cb()
  }

  const path = config.upload.path + '/' + file

  fs.unlink(path, (err) => {
    if (err) {
      if (err.errno === 34) {
        log.error('[file] issue with file path')
      }
      log.error({err: err, path: path}, '[file] error deleting file')
      return cb(Boom.internal())
    }
    log.info({path: path}, '[file] successfully deleted file')
    cb()
  })
}

function saveFile (kind, data, cb) {
  const mimeType = data.hapi.headers['content-type']
  const fileInfo = {
    id: kind + '_' + Math.random().toString(36).substr(2, 20),
    kind: kind,
    name: urlencode.decode(data.hapi.filename)
  }
  const file = data
  const path = config.upload.path + '/' + fileInfo.id

  const fileStream = fs.createWriteStream(path)

  fileStream.on('error', (err) => {
    if (err && err.errno === 34) {
      log.error('[file] issue with file path')
    }
    log.error({err: err}, '[file] error uploading file')
    return cb(Boom.internal())
  })

  file.pipe(fileStream)

  file.on('end', (err) => {
    if (err) {
      log.error({err: err}, '[file] error uploading file')
      return cb(Boom.badData(err))
    }

    let index = -1

    async.each(options.upload, (o, cbAsync) => {
      if (o.kind === kind) {
        index = o.mimes.indexOf(mimeType)
      }
      cbAsync()
    },
    function done (err) {
      if (err) {
        log.error({err: err}, '[file] error running through options')
        return cb(Boom.internal(err))
      }
      if (index === -1) {
        log.error({err: err}, '[file] invalid file type for requested kind')
        return cb(Boom.badData(err))
      }
      fileInfo.extension = Mime.extension(mimeType)
      return cb(null, fileInfo)
    })
  })
}

function zipFiles (links, cb) {
  if (links) {
    // Generate new zip with links
    const linksIds = links.map((link) => { return link.attendee })
    const filter = {
      user: { '$in': linksIds },
      updated: {'$gt': new Date('2020-01-01')}
    }
    const zip = new Zip()

    File.find(filter, (err, files) => {
      if (err) {
        log.error({err: err}, 'error getting links files')
        return cb(Boom.internal())
      }

      if (!files) {
        log.error('No files')
        return cb(Boom.notFound())
      }

      if (files) {
        async.eachSeries(files, (file, cbAsync) => {
          let link = links.find((link) => { return link.attendee === file.user })

          server.methods.user.get({'id': file.user}, (err, user) => {
            if (err) {
              return cbAsync(Boom.internal())
            }
            fs.readFile(`${config.upload.path}/${file.id}`, (err, fileData) => {
              if (!err) {
                zip.addFile(`${user.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.pdf`, fileData, `Notes: ${link.notes}`, 644)
                if (link.notes) {
                  let note = '\nEmail: ' + link.notes.contacts.email ? link.notes.contacts.email : '-' +
                  '\nPhone: ' + link.notes.contacts.phone ? link.notes.contacts.phone : '-' +
                  '\nInterests: ' + link.notes.interestedIn ? link.notes.interestedIn : '-' +
                  '\nDegree: ' + link.notes.degree ? link.notes.degree : '-' +
                  '\nAvailability: ' + link.notes.availability ? link.notes.availability : '-' +
                  '\nOther obserbations: ' + link.notes.otherObservations ? link.notes.otherObservations : '-'

                  zip.addFile(`${user.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.txt`, new Buffer(`Your notes, taken on ${new Date(link.created).toUTCString()}: ${note}`), `Notes: ${note}`, 644)
                }
              } else {
                log.error(err)
              }
            })
            return cbAsync()
          })
        }, (err) => {
          if (err) {
            return cb(Boom.internal())
          }
          zip.toBuffer((buffer) => {
            fs.writeFile(config.upload.cvsLinkPath, buffer, (err) => {
              if (err) {
                return (Boom.internal())
              }
              return cb(null, true)
            })
          })
        })
      }
    })
  } else {
    // - see if old exists && verify freshness
    fs.stat(config.upload.cvsZipPath, (err, stats) => {
      if (err && err.code !== 'ENOENT') {
        log.error({err: err, links: links}, '[file] Error reading cvsZipFile')
        return cb(Boom.internal())
      }

      fs.stat(config.upload.path, (dirErr, dirStats) => {
        if (dirErr && dirErr.code !== 'ENOENT') {
          log.error({err: dirErr}, '[dir] Error reading uploads dir')
          return cb(Boom.internal())
        }

        // Prevents Big Zip from being generated on every request. Acts like a cache
        if (!err && !dirErr && new Date(dirStats.mtime).getTime() < new Date(stats.mtime).getTime()) {
          return cb()
        }

        // const filter = {
        //   updated: {'$gt': new Date('2021-02-25')}
        // }

        let zip = new Zip()
        log.info('Zipping...')
        // File.find(filter, (err, files) => {
        //   if (err) {
        //     return cb(Boom.internal())
        //   }

        //   log.info(`Found ${files.length} files to zip`)

        //   async.eachSeries(files, (file, cbAsync) => {
        //     fs.readFile(`${config.upload.path}/${file.id}`, (err, fileData) => {
        //       if (err) {
        //         log.error(`File ${file.id} not found`)
        //         return cbAsync()
        //       }
        //       zip.addFile(`${file.id}.pdf`, fileData, '', 644) // .pdf hardcoded ¯\_(ツ)_/¯
        //       return cbAsync()
        //     })
        //   }, (err) => {
        //     if (err) {
        //       return cb(Boom.internal())
        //     }

        //     log.info('writing zip')
        //     zip.toBuffer(buffer => {
        //       fs.writeFile(config.upload.cvsZipPath, buffer, (err) => {
        //         if (err) {
        //           return (Boom.internal())
        //         }
        //         return cb()
        //       })
        //     })
        //   })
        // })

        fs.readdir(config.upload.path, (err, files) => {
          if (err) {
            return cb(Boom.internal())
          }

          async.eachSeries(files, (file, cbAsync) => {
            fs.readFile(`${config.upload.path}/${file}`, (err, fileData) => {
              if (err) {
                return
              }
              zip.addFile(`${file}.pdf`, fileData, '', 644) // .pdf hardcoded ¯\_(ツ)_/¯
              return cbAsync()
            })
          }, (err) => {
            if (err) {
              return cb(Boom.internal())
            }
            zip.toBuffer(buffer => {
              fs.writeFile(config.upload.cvsZipPath, buffer, (err) => {
                if (err) {
                  return (Boom.internal())
                }
                return cb()
              })
            })
          })
        })
      })
    })
  }
}
