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

async function createArray (files) {
  if (!files.length) {
    return await create(files)
  }
  async.map(files, create, (err, results) => {
    if (err) {
      log.error({err: err, files: files}, '[files] error creating files in db')
    }
    return results
  })
}

async function create (file) {
  // file.user = (cb && user) || file.user
  // cb = cb || user

  file.created = file.updated = Date.now()

  let _file = await File.create(file)

  if (!_file) {
    log.error({err: err, file: file.id}, 'error creating file')
    return Boom.internal()
  }

  return _file.toObject({ getters: true })
}

async function update (id, file, user, query) {
  //cb = cb || query || user
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

  let filter = { id: id }

  let _file = await File.findOneAndUpdate(filter)

  if (!_file) {
    log.error({err: err, file: id}, 'error updating file')
    return Boom.notFound()
  }

  return _file.toObject({ getters: true })
}

async function get (id, query) {
  //cb = cb || query // fields is optional
  if (!id) { // check if file exists use case
    log.warn('[file] tried to get with empty file id')
    return
  }

  const fields = fieldsParser(query.fields)
  const filter = { $or: [{ id: id }, { user: id }] }
  
  let file = await File.findOne(filter, fields)

  if (!file) {
    log.error('file not found')
    return Boom.notFound()
  }

  return file.toObject({ getters: true })
}

async function list (query) {
  //cb = cb || query // fields is optional

  const filter = {}
  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  let file = await File.find(filter, fields, options)

  if (!file) {
    log.error('No files were found in database')
    return Boom.notFound()
  }

  return file
}

async function remove(id) {
  let filter = {id: id}

  let file = await File.findOneAndRemove(filter, { new: false })

  if (!file) {
    log.error({err: 'not found', file: id}, 'error deleting file')
    return Boom.notFound()
  }

  deleteFile(file.id, cb)
  return file
}

async function removeFromUser(id) {
  let filter = { user: id }

  let file = await File.findOne(filter)

  if (!file) {
    log.error('Could not find file in database')
    return Boom.notFound()
  }

  remove(file.id)
}

function uploadCV (data) {
  return upload('cv', data)
}

function upload (kind, data) {
  const files = []
  //TODO: cbAsync
  async.each(Object.keys(data), (prop, cbAsync) => {
    if (data.hasOwnProperty(prop)) {
      files.push(prop)
    }
    cbAsync()
  },
  (err) => {
    if (err) {
      log.error({err: err, kind: kind, files: files}, '[files] error assigning file keys')
      return Boom.internal()
    }
    saveFiles(kind, files, data)
  })
}

function saveFiles (kind, files, data) {
  if (!files) {
    log.error('saveFiles: No files were given')
    return Boom.badData()
  }

  if (files.length === 1) {
    return saveFile(kind, data[files[0]])
  }

  //TODO: FIXME ME
  async.map(files, (file, cbAsync) => {
    saveFile(kind, data[file], cbAsync)
  }, cb)
}

function deleteFile (file) {
  // only delete if file defined, doesn't throw err
  if (!file || file === '') {
    log.warn('[file] tried to delete empty file path')
    return
  }

  const path = config.upload.path + '/' + file

  fs.unlink(path, (err) => {
    if (err) {
      if (err.errno === 34) {
        log.error('[file] issue with file path')
      }
      log.error({err: err, path: path}, '[file] error deleting file')
      return Boom.internal()
    }
    log.info({path: path}, '[file] successfully deleted file')
  })
}

function saveFile (kind, data) {
  const mimeType = data.hapi.headers['content-type']
  const fileInfo = {
    //TODO: THIS IS VERY WRONG!!! WE COULD HAVE TWO DOCUMENTS
    //WITH THE SAME ID!!!
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
    return Boom.internal()
  })

  file.pipe(fileStream)

  file.on('end', (err) => {
    if (err) {
      log.error({err: err}, '[file] error uploading file')
      return Boom.badData(err)
    }

    let index = -1

    //TODO: cbAsync
    async.each(options.upload, (o, cbAsync) => {
      if (o.kind === kind) {
        index = o.mimes.indexOf(mimeType)
      }
      cbAsync()
    },
    function done (err) {
      if (err) {
        log.error({err: err}, '[file] error running through options')
        return Boom.internal(err)
      }
      if (index === -1) {
        log.error({err: err}, '[file] invalid file type for requested kind')
        return Boom.badData(err)
      }
      fileInfo.extension = Mime.extension(mimeType)
      return fileInfo
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
        return Boom.internal()
      }

      if (!files) {
        log.error('No files')
        return Boom.notFound()
      }

      if (files) {
        //TODO: cbAsync
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
            return Boom.internal()
          }
          zip.toBuffer((buffer) => {
            fs.writeFile(config.upload.cvsLinkPath, buffer, (err) => {
              if (err) {
                return Boom.internal()
              }
              return true
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
        return Boom.internal()
      }

      fs.stat(config.upload.path, (dirErr, dirStats) => {
        if (dirErr && dirErr.code !== 'ENOENT') {
          log.error({err: dirErr}, '[dir] Error reading uploads dir')
          return Boom.internal()
        }

        // Prevents Big Zip from being generated on every request. Acts like a cache
        if (!err && !dirErr && new Date(dirStats.mtime).getTime() < new Date(stats.mtime).getTime()) {
          return
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
            return Boom.internal()
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
              return Boom.internal()
            }
            zip.toBuffer(buffer => {
              fs.writeFile(config.upload.cvsZipPath, buffer, (err) => {
                if (err) {
                  return Boom.internal()
                }
                return
              })
            })
          })
        })
      })
    })
  }
}
