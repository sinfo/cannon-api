const Lab = require('lab')
const Code = require('code')
const async = require('async')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const aux = token.createJwt('john.doe')

const secretId = 'secret_achievement_'

const credentialsA = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'admin'
}

const credentialsB = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'user'
}
const achievementId = 'WENT-TO-SINFO-XXII'

const achievementA = {
  name: 'WENT TO SINFO XXII',
  event: 'SINFO XXII',
  value: 10,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  }
}

const changesToA = {
  name: 'WENT TO SINFO XXIII'
}

const event = 'SINFO XXII'

let codeA = ''
let codeB = ''

lab.experiment('Achievement', () => {
  lab.after('remove achievements', (done) => {
    const optionsA = {
      method: 'DELETE',
      url: `/achievements/${event}_${secretId}0`,
      credentials: credentialsA
    }

    const optionsB = {
      method: 'DELETE',
      url: `/achievements/${event}_${secretId}1`,
      credentials: credentialsA
    }

    async.parallel([
      (cb) => {
        server.inject(optionsA, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsB, (response) => {
          return cb()
        })
      }
    ], (_, results) => {
      done()
    })
  })

  lab.test('Create as an admin', (done) => {
    const options = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsA,
      payload: achievementA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)

      done()
    })
  })

  lab.test('List all as an admin', (done) => {
    const options = {
      method: 'GET',
      url: '/achievements',
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
      url: '/achievements/' + achievementId,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)

      done()
    })
  })

  lab.test('List all as an user', (done) => {
    const options = {
      method: 'GET',
      url: '/achievements',
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result[0].name).to.be.string
      done()
    })
  })

  lab.test('Get one  as an user', (done) => {
    const options = {
      method: 'GET',
      url: '/achievements/' + achievementId,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)

      done()
    })
  })

  lab.test('Update as an admin', (done) => {
    const options = {
      method: 'PUT',
      url: '/achievements/' + achievementId,
      credentials: credentialsA,
      payload: changesToA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(changesToA.name)

      done()
    })
  })

  lab.test('Update as a user', (done) => {
    const options = {
      method: 'PUT',
      url: '/achievements/' + achievementId,
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
      url: '/achievements/' + achievementId,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(changesToA.name)
      done()
    })
  })

  lab.test('Create as a user', (done) => {
    const options = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsB,
      payload: achievementA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)

      done()
    })
  })

  lab.test('Delete as a user', (done) => {
    const options = {
      method: 'DELETE',
      url: '/achievements/' + achievementId,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Create secret achievement', (done) => {
    const value = 50
    const payload = {
      validity: new Date(new Date().getTime() + (1000 * 60 * 60)),
      event: 'SINFO XXII',
      points: value
    }

    const options = {
      method: 'POST',
      url: '/achievements/secret',
      credentials: credentialsA,
      payload: payload
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result.id).to.equal(`${event}_${secretId}0`)
      Code.expect(result.value).to.equal(value)
      codeA = result.code.code

      server.inject(options, (response) => {
        const result = response.result

        Code.expect(response.statusCode).to.equal(201)
        Code.expect(result.id).to.equal(`${event}_${secretId}1`)
        Code.expect(result.value).to.equal(value)
        codeB = result.code.code

        done()
      })
    })
  })

  lab.test('List secret with codes', (done) => {
    const start = new Date(new Date().getTime() - (24 * 1000 * 60 * 60))
    const end = new Date(new Date().getTime() + (24 * 1000 * 60 * 60))
    const query = `?start=${start}&end=${end}&kind=secret
    `
    const options = {
      method: 'GET',
      url: `/achievements/code${query}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => { // Admin
      const result = response.result

      result.sort((a, b) => { return a < b ? 1 : -1 })

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result.length).to.equal(2)
      Code.expect(result[0].code).to.be.instanceof(Object)
      Code.expect(result[0].code.code).to.equal(codeA)
      Code.expect(result[1].code).to.be.instanceof(Object)
      Code.expect(result[1].code.code).to.equal(codeB)

      done()
    })
  })

  lab.test('Sign in to secret with code', (done) => {
    const options = {
      method: 'POST',
      url: `/achievements/redeem/secret`,
      credentials: credentialsB,
      payload: {code: codeA}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.code.code).to.equal(codeA)
      Code.expect(result.users.length).to.equal(1)
      Code.expect(result.users[0]).to.equal(credentialsB.user.id)

      done()
    })
  })

  lab.test('Sign in to secret with code fail', (done) => {
    const options = {
      method: 'POST',
      url: `/achievements/redeem/secret`,
      credentials: credentialsB,
      payload: {code: 'wrongcode123'}
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(404)

      done()
    })
  })
})
