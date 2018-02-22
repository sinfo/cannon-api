const Lab = require('lab')
const Code = require('code')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const aux = token.getJWT('john.doe')

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

const credentialsC = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'team'
}

const userA = {
  id: 'john.doe',
  name: 'John Doe',
  mail: 'john@doe.com'
}

const changesToA = {
  name: 'John Doe Doe'
}

const promoteAtoCompany = {
  role: 'company',
  company: {
    edition: 'sinfo25',
    company: 'sinfo-consulting'
  }
}

const updatedACompany = {
  company: {
    edition: 'sinfo25',
    company: 'sinfo-operations'
  }
}

lab.experiment('User', () => {
  lab.test('Create as admin', (done) => {
    const options = {
      method: 'POST',
      url: '/users',
      credentials: credentialsA,
      payload: userA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(userA.name)

      done()
    })
  })

  lab.test('List all as admin', (done) => {
    const options = {
      method: 'GET',
      url: '/users',
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

  lab.test('Get one as admin', (done) => {
    const options = {
      method: 'GET',
      url: '/users/' + userA.id,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(userA.name)

      done()
    })
  })

  lab.test('Get one as user', (done) => {
    const options = {
      method: 'GET',
      url: '/users/' + userA.id,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(userA.name)

      done()
    })
  })

  lab.test('Get me as admin', (done) => {
    const options = {
      method: 'GET',
      url: '/users/me',
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(userA.name)

      done()
    })
  })

  lab.test('Get me as user', (done) => {
    const options = {
      method: 'GET',
      url: '/users/me',
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(userA.name)

      done()
    })
  })

  lab.test('Update as admin', (done) => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      credentials: credentialsA,
      payload: changesToA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(changesToA.name)

      done()
    })
  })

  lab.test('Promote to team as user', (done) => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      credentials: credentialsB,
      payload: { role: 'team' }
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Promote to team as team', (done) => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      credentials: credentialsC,
      payload: { role: 'team' }
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.role).to.be.equal('team')

      done()
    })
  })

  lab.test('Promote to company as team', (done) => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      credentials: credentialsC,
      payload: promoteAtoCompany
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.company[0]).to.be.instanceof(Object)
      Code.expect(result.company[0].edition).to.equal(promoteAtoCompany.company.edition)
      Code.expect(result.company[0].company).to.equal(promoteAtoCompany.company.company)
      Code.expect(result.company[0].company).to.equal(promoteAtoCompany.company.company)
      Code.expect(result.role).to.be.equal('company')

      done()
    })
  })

  lab.test('Update A company as team', (done) => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      credentials: credentialsC,
      payload: updatedACompany
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.company[0]).to.be.instanceof(Object)
      Code.expect(result.company[0].edition).to.equal(updatedACompany.company.edition)
      Code.expect(result.company[0].company).to.equal(updatedACompany.company.company)
      Code.expect(result.company[1]).to.not.exist()

      done()
    })
  })

  lab.test('Delete A company as team', (done) => {
    const options = {
      method: 'DELETE',
      url: '/users/' + userA.id + '/company?editionId=' + updatedACompany.company.edition,
      credentials: credentialsC
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.company[0]).to.not.exist()
      done()
    })
  })

  lab.test('Demote me', (done) => {
    const options = {
      method: 'PUT',
      url: '/users/me',
      credentials: credentialsC,
      payload: {role: 'user'}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceOf(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.role).to.be.equal('user')
      done()
    })
  })

  lab.test('Update me as user', (done) => {
    const options = {
      method: 'PUT',
      url: '/users/me',
      credentials: credentialsB,
      payload: {role: 'team'}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(401)
      done()
    })
  })

  lab.test('Promote to company as user', (done) => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      credentials: credentialsB,
      payload: promoteAtoCompany
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('List all as user', (done) => {
    const options = {
      method: 'GET',
      url: '/users',
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

  lab.test('Update as user', (done) => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      credentials: credentialsB,
      payload: changesToA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Delete as admin', (done) => {
    const options = {
      method: 'DELETE',
      url: '/users/' + userA.id,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(changesToA.name)
      done()
    })
  })

  lab.test('Create as user', (done) => {
    const options = {
      method: 'POST',
      url: '/users',
      credentials: credentialsB,
      payload: userA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Delete as user', (done) => {
    const options = {
      method: 'DELETE',
      url: '/users/' + userA.id,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })
})
