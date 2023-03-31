const Boom = require('@hapi/boom')
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

async function createArray(files) {
  if (!files.length) {
    return await create(files)
  }
  async.map(files, create, (err, results) => {
    if (err) {
      log.error({ err: err, files: files }, '[files] error creating files in db')
    }
    return results
  })
}

async function create(file) {
  // file.user = (cb && user) || file.user
  // cb = cb || user

  file.created = file.updated = Date.now()

  let _file = await File.create(file).catch((err) => {
    if (err.code === 11000) {
      log.error({ msg: "file is a duplicate" })
      throw Boom.conflict(`file "${file.id}" is a duplicate`)
    }
    log.error({ err: err, msg: 'error creating file' }, 'error creating file')
    throw Boom.internal()
  })

  if (!_file) {
    log.error({ err: err, file: file.id }, 'error creating file')
    throw Boom.internal()
  }

  return _file.toObject({ getters: true })
}

async function update(id, file, user, query) {
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

  file.updated = Date.now()
  file.$setOnInsert = { created: file.updated }
  file.user = user || file.user || null

  let filter = { id: id }

  let _file = await File.findOneAndUpdate(filter, file, {
    new: true,
    upsert: true
  })

  if (!_file) {
    log.error({ file: id }, '[file] error updating file')
    throw Boom.notFound()
  }

  return _file.toObject({ getters: true })
}

async function get(id, query) {
  //cb = cb || query // fields is optional
  if (!id) { // check if file exists use case
    log.warn('[file] tried to get with empty file id')
    throw new Error('[file] tried to get with empty file id')
  }

  const fields = query ? fieldsParser(query.fields) : {}
  const filter = { $or: [{ id: id }, { user: id }] }

  let file = await File.findOne(filter, fields)

  if (!file) {
    log.error('[file] file not found')
    return -1
  }

  return file.toObject({ getters: true })
}

async function list(query) {
  //cb = cb || query // fields is optional

  const filter = {}
  const fields = query ? fieldsParser(query.fields) : {}
  const options = query ? {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  } : {}

  let files = await File.find(filter, fields, options)

  return files
}

async function remove(id) {
  let filter = { id: id }

  let file = await File.findOneAndRemove(filter, { new: false })

  if (!file) {
    log.error({ err: 'not found', file: id }, 'error deleting file')
    throw Boom.notFound()
  }

  await deleteFile(file.id)
  return file
}

async function removeFromUser(id) {
  let filter = { user: id }

  let file = await File.findOne(filter)

  if (!file) {
    log.error('Could not find file in database')
    throw Boom.notFound()
  }

  return remove(file.id)
}

async function uploadCV(data) {
  return upload('cv', data)
}

async function upload(kind, data) {
  const files = []
  await async.each(Object.keys(data), async (prop) => {
    if (data.hasOwnProperty(prop)) {
      files.push(prop)
    }
  }).catch((err) => {
    if (err) {
      log.error({ err: err, kind: kind, files: files }, '[files] error assigning file keys')
      throw Boom.internal()
    }
  })

  return saveFiles(kind, files, data)
}

async function saveFiles(kind, files, data) {
  if (!files) {
    log.error('saveFiles: No files were given')
    throw Boom.badData()
  }

  if (files.length === 1) {
    return await saveFile(kind, data[files[0]])
  }

  await async.map(files, (file, cbAsync) => {
    saveFile(kind, data[file], cbAsync)
  })
}

async function deleteFile(file) {
  // only delete if file defined, doesn't throw err

  if (!file || file === '') {
    log.warn('[file] tried to delete empty file path')
    throw new Error('[file] tried to delete empty file path')
  }

  const path = config.upload.path + '/' + file

  fs.unlink(path, (err) => {
    if (err) {
      if (err.errno === 34) {
        log.error('[file] issue with file path')
      } else if (err.errno === -2) {
        log.error('[file] no file was found')
        return
      }

      log.error({ err: err, path: path }, '[file] error deleting file')
      throw Boom.boomify(err)
    }
    log.info({ path: path }, '[file] successfully deleted file')
  });
}

async function saveFile(kind, data) {
  const mimeType = data.hapi.headers['content-type']
  const fileInfo = {
    id: kind + '_' + Math.random().toString(36).substring(2, 20),
    kind: kind,
    name: urlencode.decode(data.hapi.filename)
  }
  const file = data
  const path = config.upload.path + '/' + fileInfo.id

  return new Promise((resolve) => {
    const fileStream = fs.createWriteStream(path)

    fileStream.on('error', (err) => {
      if (err && err.errno === 34) {
        log.error('[file] issue with file path')
      }
      log.error({ err: err }, '[file] error uploading file')
      throw Boom.internal()
    })

    file.pipe(fileStream)

    file.on('end', async (err) => {
      if (err) {
        log.error({ err: err }, '[file] error uploading file')
        throw Boom.badData(err)
      }

      let index = -1

      await async.each(options.upload, async (o) => {
        if (o.kind === kind) {
          index = o.mimes.indexOf(mimeType)
        }
      }).catch((err) => {
        if (err) {
          log.error({ err: err }, '[file] error running through options')
          throw Boom.internal(err)
        }
      })
      if (index === -1) {
        log.error({ err: err }, '[file] invalid file type for requested kind')
        throw Boom.badData(err)
      }

      fileInfo.extension = Mime.getExtension(mimeType)
      resolve(fileInfo)
    })
  })
}

async function zipFiles(links) {
  if (links) {
    // Generate new zip with links
    const linksIds = links.map((link) => { return link.attendee })
    const filter = {
      user: { '$in': linksIds },
      updated: { '$gt': new Date('2020-01-01') }
    }
    const zip = new Zip()

    let files = await File.find(filter)
    if (files) {
      await async.eachSeries(files, async (file) => {
        log.info({ file: `Processing CV file: ${file.id}` })
        let link = links.find((link) => { return link.attendee === file.user })
        let user = await server.methods.user.get({ 'id': file.user })
        let fileData = fs.readFileSync(`${config.upload.path}/${file.id}`)
        zip.addFile(`${user.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.pdf`, fileData, `Notes: ${link.notes}`)
        if (link.notes) {
          let note = '\nEmail: ' + link.notes.contacts.email ? link.notes.contacts.email : '-' +
            '\nPhone: ' + link.notes.contacts.phone ? link.notes.contacts.phone : '-' +
              '\nInterests: ' + link.notes.interestedIn ? link.notes.interestedIn : '-' +
                '\nDegree: ' + link.notes.degree ? link.notes.degree : '-' +
                  '\nAvailability: ' + link.notes.availability ? link.notes.availability : '-' +
                    '\nOther obserbations: ' + link.notes.otherObservations ? link.notes.otherObservations : '-'
          zip.addFile(`${user.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.txt`, Buffer.from(`Your notes, taken on ${new Date(link.created).toUTCString()}: ${note}`), `Notes: ${note}`)
        }
      }).catch((err) => {
        if (err && err.code !== 'ENOENT') {
          log.error({ err: err }, '[file] Cannot compile list of cv links')
          throw Boom.internal(err)
        }
      })

      zip.writeZip(config.upload.cvsLinkPath)
      return true
    } else {
      log.error('No files')
      throw Boom.notFound()
    }
  } else {
    try {
      let stats = fs.statSync(config.upload.cvsZipPath)
      let dirStats = fs.statSync(config.upload.path)

      // Prevents Big Zip from being generated on every request. Acts like a cache
      if (stats && (new Date(dirStats.mtime).getTime() < new Date(stats.mtime).getTime())) {
        return
      }
    } catch (err) {
      if (err && err.code !== 'ENOENT') {
        log.error({ err: err, links: links }, '[file] Error reading cvsZipFile/uploads dir')
        throw Boom.internal()
      }
    }

    let zip = new Zip()
    log.info('Zipping...')

    let files = fs.readdirSync(config.upload.path)
    await async.eachSeries(files, async (file) => {
      let fileData = fs.readFileSync(`${config.upload.path}/${file}`)
      zip.addFile(`${file}.pdf`, fileData, '') // .pdf hardcoded ¯\_(ツ)_/¯
    })

    zip.writeZip(config.upload.cvsZipPath)
    return false
  }
}
