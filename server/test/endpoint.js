const Lab = require('lab')
const Code = require('code')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const auxAdmin = token.createJwt('john.doe')
const auxUser = token.createJwt('jane.doe')

const credentialsAdmin = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: auxAdmin.token,
  scope: 'admin'
}

const credentialsUser = {
  user: {
    id: 'jane.doe',
    name: 'Jane Doe'
  },
  bearer: auxUser.token,
  scope: 'user'
}

lab.experiment('Endpoint', () => {
  lab.test('Create as an admin', (done) => {
    const from = new Date()
    const to = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000) // will be open for 2 weeks

    const options = {
      method: 'POST',
      url: '/company-endpoint',
      credentials: credentialsAdmin,
      payload: {
        companies: ["sinfo-consulting", "chavaile-consulting"],
        edition: "25-SINFO",
        validaty: {
          from,
          to // will be open for 2 weeks
        }
      }
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result).to.have.lenght(2)

      done()
    })
  })

  lab.test('Create as a user', (done) => {
    const from = new Date()
    const to = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000) // will be open for 2 weeks

    const options = {
      method: 'POST',
      url: '/company-endpoint',
      credentials: credentialsUser,
      payload: {
        companies: ["sinfo-consulting", "chavaile-consulting"],
        edition: "25-SINFO",
        validaty: {
          from,
          to // will be open for 2 weeks
        }
      }
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('List as an admin', (done) => {
    const options = {
      method: 'GET',
      url: '/company-endpoint',
      credentials: credentialsAdmin
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result).to.have.lenght(2)

      done()
    })
  })

  lab.test('List as a user', (done) => {
    const options = {
      method: 'GET',
      url: '/company-endpoint',
      credentials: credentialsUser
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Get as an admin', (done) => {
    const options = {
      method: 'GET',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      credentials: credentialsAdmin
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.company).to.be("sinfo-consulting")
      Code.expect(result.edition).to.be("25-SINFO")
      Code.expect(result.validaty.from).to.be.string()
      Code.expect(result.validaty.to).to.be.string()

      done()
    })
  })

  lab.test('Get as a user', (done) => {
    const options = {
      method: 'GET',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      credentials: credentialsUser
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Update as an Admin', (done) => {
    const to = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) 
    const options = {
      method: 'PUT',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      credentials: credentialsAdmin,
      payload: {
        validaty: {
          to
        }
      }
    }

    server.inject(options, (response) => {
      const result = reponse.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result.company).to.be("sinfo-consulting")
      Code.expect(result.edition).to.be("25-SINFO")
      Code.expect(result.validity.to).to.be.equal.to(to)

      done()
    })
  })

  lab.test('Update as a User', (done) => {
    const to = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) 
    const options = {
      method: 'PUT',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      credentials: credentialsUser,
      payload: {
        validaty: {
          to
        }
      }
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Delete as a User', (done) => {
    const options = {
      method: 'PUT',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      credentials: credentialsUser
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Delete as an Admin', (done) => {
    const options = {
      method: 'PUT',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      credentials: credentialsAdmin
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(201)
      done()
    })
  })
})
