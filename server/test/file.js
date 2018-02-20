const Lab = require('lab')
const Code = require('code')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const aux = token.createJwt('john.doe')

const credentialsA = {
  user: {
    id: 'john.doe',
    name: 'John Doe',
    role: 'admin'
  },
  bearer: aux.token,
  scope: 'admin'
}

const credentialsB = {
  user: {
    id: 'john.doe',
    name: 'John Doe',
    role: 'admin'
  },
  bearer: aux.token,
  scope: 'user'
}

const fileA = {
  id: 'readme',
  user: 'john.doe',
  name: 'readme',
  kind: 'important',
  extension: 'txt'
}

const changesToA = {
  id: 'readme',
  name: 'README',
  kind: 'important',
  extension: 'txt'
}

lab.experiment('File', () => {
  lab.test('Create as an admin', (done) => {
    const options = {
      method: 'POST',
      url: '/files',
      credentials: credentialsA,
      payload: fileA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(fileA.id)
      Code.expect(result.name).to.equal(fileA.name)
      Code.expect(result.extension).to.equal(fileA.extension)

      done()
    })
  })

  lab.test('List all as an admin', (done) => {
    const options = {
      method: 'GET',
      url: '/files',
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result[0].name).to.be.string
      done()
    })
  })

  lab.test('Get one as an admin', (done) => {
    const options = {
      method: 'GET',
      url: '/files/' + fileA.id,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(fileA.id)
      Code.expect(result.name).to.equal(fileA.name)
      Code.expect(result.extension).to.equal(fileA.extension)

      done()
    })
  })

  lab.test('List all as a user', (done) => {
    const options = {
      method: 'GET',
      url: '/files',
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Get one as a user', (done) => {
    const options = {
      method: 'GET',
      url: '/files/' + fileA.id,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Update as an admin', (done) => {
    const options = {
      method: 'PUT',
      url: '/files/' + fileA.id,
      credentials: credentialsA,
      payload: changesToA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(fileA.id)
      Code.expect(result.name).to.equal(changesToA.name)
      Code.expect(result.extension).to.equal(fileA.extension)

      done()
    })
  })

  lab.test('Update as an user', (done) => {
    const options = {
      method: 'PUT',
      url: '/files/' + fileA.id,
      credentials: credentialsB,
      payload: changesToA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)

      done()
    })
  })

  lab.test('Delete as an admin', (done) => {
    const options = {
      method: 'DELETE',
      url: '/files/' + fileA.id,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(fileA.id)
      Code.expect(result.name).to.equal(changesToA.name)
      Code.expect(result.extension).to.equal(fileA.extension)
      done()
    })
  })

  lab.test('Create as an user', (done) => {
    const options = {
      method: 'POST',
      url: '/files',
      credentials: credentialsB,
      payload: fileA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Delete as an user', (done) => {
    const options = {
      method: 'DELETE',
      url: '/files/' + fileA.id,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })
})
