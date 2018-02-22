const Lab = require('lab')
const Code = require('code')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const aux = token.createJwt('admin')
const auxA = token.createJwt('john.doe')
const auxB = token.createJwt('jane.doe')
const auxC = token.createJwt('conor.mcgregor')

const credentialsAdmin = {
  user: {
    id: 'admin',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'admin'
}

const userA = {
  id: 'john.doe',
  name: 'John Doe',
  mail: 'john@doe.com',
  role: 'company',
  company: [{
    edition: '25-SINFO',
    company: 'SINFO'
  }]
}

const credentialsA = {
  user: userA,
  bearer: auxA.token,
  scope: 'company'
}

const credentialsB = {
  user: {
    id: 'jane.doe',
    name: 'Jane Doe'
  },
  bearer: auxB.token,
  scope: 'user'
}

const userC = {
  id: 'conor.mcgregor',
  name: 'Conner Mcgregor',
  mail: 'conor@ufc.com',
  role: 'company',
  company: [{
    edition: '25-SINFO',
    company: 'UFC'
  }]
}

const credentialsC = {
  user: userC,
  bearer: auxC.token,
  scope: 'company'
}

const linkA = {
  userId: credentialsA.user.id,
  attendeeId: credentialsB.user.id,
  editionId: userA.company[0].edition,
  note: 'Jane had a great sence of humor'
}

const changesToA = {
  note: 'Jane had a great sence of humor and great Perl skils'
}

lab.experiment('Link', () => {
  lab.before((done) => {
    const optionsA = {
      method: 'POST',
      url: '/users',
      credentials: credentialsAdmin,
      payload: userA
    }
    const optionsB = {
      method: 'POST',
      url: '/users',
      credentials: credentialsAdmin,
      payload: userC
    }
    server.inject(optionsA, (response) => {
      server.inject(optionsB, (response) => {
        done()
      })
    })
  })

  lab.after((done) => {
    const optionsA = {
      method: 'DELETE',
      url: '/users/' + userA.id,
      credentials: credentialsAdmin
    }
    const optionsB = {
      method: 'DELETE',
      url: '/users/' + userC.id,
      credentials: credentialsAdmin
    }

    server.inject(optionsA, (response) => {
      server.inject(optionsB, (response) => {
        done()
      })
    })
  })

  lab.test('Create A as company', (done) => {
    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/link`,
      credentials: credentialsA,
      payload: linkA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkA.userId)
      Code.expect(result.company).to.equal(userA.company[0].company)
      Code.expect(result.edition).to.equal(linkA.editionId)
      Code.expect(result.attendee).to.equal(linkA.attendeeId)
      Code.expect(result.note).to.equal(linkA.note)

      done()
    })
  })

  lab.test('Get as company', (done) => {
    const options = {
      method: 'Get',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result.user).to.equal(linkA.userId)
      Code.expect(result.company).to.equal(userA.company[0].company)
      Code.expect(result.edition).to.equal(linkA.editionId)
      Code.expect(result.attendee).to.equal(linkA.attendeeId)
      Code.expect(result.note).to.equal(linkA.note)

      done()
    })
  })

  lab.test('Get other company as company', (done) => {
    const options = {
      method: 'Get',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsC
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(404)
      done()
    })
  })

  lab.test('Update remove note as company', (done) => {
    const options = {
      method: 'PUT',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsA,
      payload: {note: ""}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkA.userId)
      Code.expect(result.company).to.equal(userA.company[0].company)
      Code.expect(result.edition).to.equal(linkA.editionId)
      Code.expect(result.attendee).to.equal(linkA.attendeeId)
      Code.expect(result.note).to.equal("")

      done()
    })
  })

  lab.test('Update as company', (done) => {
    const options = {
      method: 'PUT',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsA,
      payload: changesToA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkA.userId)
      Code.expect(result.company).to.equal(userA.company[0].company)
      Code.expect(result.edition).to.equal(linkA.editionId)
      Code.expect(result.attendee).to.equal(linkA.attendeeId)
      Code.expect(result.note).to.equal(changesToA.note)

      done()
    })
  })

  lab.test('Update Non Existing as company', (done) => {
    const options = {
      method: 'PUT',
      url: `/company/NullConsulting/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsA,
      payload: changesToA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(404)

      done()
    })
  })

  lab.test('List as company', (done) => {
    const options = {
      method: 'Get',
      url: `/company/${userA.company[0].company}/link?editionId=${linkA.editionId}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result[1]).to.not.exist()
      Code.expect(result[0].user).to.equal(linkA.userId)
      Code.expect(result[0].company).to.equal(userA.company[0].company)
      Code.expect(result[0].edition).to.equal(linkA.editionId)
      Code.expect(result[0].attendee).to.equal(linkA.attendeeId)
      Code.expect(result[0].note).to.equal(changesToA.note)

      done()
    })
  })

  lab.test('List Non Existing as company', (done) => {
    const options = {
      method: 'Get',
      url: `/company/NullConsulting/link?editionId=${linkA.editionId}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(404)
      done()
    })
  })

  lab.test('Create same as company', (done) => {
    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/link`,
      credentials: credentialsA,
      payload: linkA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(409)

      done()
    })
  })

  lab.test('Delete A as company', (done) => {
    const options = {
      method: 'DELETE',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkA.userId)
      Code.expect(result.company).to.equal(userA.company[0].company)
      Code.expect(result.edition).to.equal(linkA.editionId)
      Code.expect(result.attendee).to.equal(linkA.attendeeId)
      Code.expect(result.note).to.equal(changesToA.note)

      done()
    })
  })

  lab.test('Create as user', (done) => {
    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/link`,
      credentials: credentialsB,
      payload: linkA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)

      done()
    })
  })

  lab.test('Get as user', (done) => {
    const options = {
      method: 'GET',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)

      done()
    })
  })

  lab.test('List as user', (done) => {
    const options = {
      method: 'GET',
      url: `/company/${userA.company[0].company}/link?editionId=${linkA.editionId}`,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)

      done()
    })
  })

  lab.test('Delete as user', (done) => {
    const options = {
      method: 'GET',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)

      done()
    })
  })
})
