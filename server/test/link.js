const Lab = require('lab')
const Code = require('code')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const auxA = token.getJWT('john.doe')
const auxB = token.getJWT('jane.doe')

const credentialsA = {
  user: {
    id: 'john.doe',
    name: 'John Doe',
    company: [{
      edition: '25-SINFO',
      company: 'SINFO'
    }]
  },
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

const linkA = {
  userId: credentialsA.user.id,
  attendeeId: credentialsB.user.id,
  editionId: credentialsA.user.company[0].edition,
  note: 'Jane had a great sence of humor'
}

const linkB = {
  userId: credentialsA.user.id,
  attendeeId: credentialsB.user.id,
  editionId: '24-SINFO',
  note: 'Jane had a great sence of humor'
}

const changesToA = {
  editionId: credentialsA.user.company[0].edition,
  note: 'Jane had a great sence of humor and great Perl skils'
}

lab.experiment('Link', () => {
  lab.test('Create A as company', (done) => {
    const options = {
      method: 'POST',
      url: `/company/${credentialsA.user.company[0].company}/link`,
      credentials: credentialsA,
      payload: linkA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkA.userId)
      Code.expect(result.company).to.equal(credentialsA.user.company[0].company)
      Code.expect(result.edition).to.equal(linkA.editionId)
      Code.expect(result.attendee).to.equal(linkA.attendeeId)
      Code.expect(result.note).to.equal(linkA.note)

      done()
    })
  })

  lab.test('Get as company', (done) => {
    const options = {
      method: 'Get',
      url: `/company/${credentialsA.user.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result.user).to.equal(linkA.userId)
      Code.expect(result.company).to.equal(credentialsA.user.company[0].company)
      Code.expect(result.edition).to.equal(linkA.editionId)
      Code.expect(result.attendee).to.equal(linkA.attendeeId)
      Code.expect(result.note).to.equal(linkA.note)

      done()
    })
  })

  lab.test('Update as company', (done) => {
    const options = {
      method: 'PUT',
      url: `/company/${credentialsA.user.company[0].company}/link/${linkA.attendeeId}`,
      credentials: credentialsA,
      payload: changesToA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkA.userId)
      Code.expect(result.company).to.equal(credentialsA.user.company[0].company)
      Code.expect(result.edition).to.equal(linkA.editionId)
      Code.expect(result.attendee).to.equal(linkA.attendeeId)
      Code.expect(result.note).to.equal(changesToA.note)

      done()
    })
  })

  lab.test('List as company', (done) => {
    const options = {
      method: 'Get',
      url: `/company/${credentialsA.user.company[0].company}/link`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result[0].user).to.equal(linkA.userId)
      Code.expect(result[0].company).to.equal(credentialsA.user.company[0].company)
      Code.expect(result[0].edition).to.equal(linkA.editionId)
      Code.expect(result[0].attendee).to.equal(linkA.attendeeId)
      Code.expect(result[0].note).to.equal(changesToA.note)

      done()
    })
  })

  lab.test('Create B as company', (done) => {
    const options = {
      method: 'POST',
      url: `/company/${credentialsA.user.company[0].company}/link`,
      credentials: credentialsA,
      payload: linkB
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkB.userId)
      Code.expect(result.company).to.equal(credentialsA.user.company[0].company)
      Code.expect(result.edition).to.equal(linkB.editionId)
      Code.expect(result.attendee).to.equal(linkB.attendeeId)
      Code.expect(result.note).to.equal(linkB.note)

      done()
    })
  })

  lab.test('List edition as company', (done) => {
    const options = {
      method: 'Get',
      url: `/company/${credentialsA.user.company[0].company}/link?editionId=${linkB.editionId}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result[1]).to.not.exist()
      Code.expect(result[0].user).to.equal(linkB.userId)
      Code.expect(result[0].company).to.equal(credentialsA.user.company[0].company)
      Code.expect(result[0].edition).to.equal(linkB.editionId)
      Code.expect(result[0].attendee).to.equal(linkB.attendeeId)
      Code.expect(result[0].note).to.equal(linkB.note)

      done()
    })
  })

  lab.test('Create same as company', (done) => {
    const options = {
      method: 'POST',
      url: `/company/${credentialsA.user.company[0].company}/link`,
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
      url: `/company/${credentialsA.user.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkA.userId)
      Code.expect(result.company).to.equal(credentialsA.user.company[0].company)
      Code.expect(result.edition).to.equal(linkA.editionId)
      Code.expect(result.attendee).to.equal(linkA.attendeeId)
      Code.expect(result.note).to.equal(changesToA.note)

      done()
    })
  })

  lab.test('Delete B as company', (done) => {
    const options = {
      method: 'DELETE',
      url: `/company/${credentialsA.user.company[0].company}/link/${linkA.attendeeId}?editionId=${linkB.editionId}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkB.userId)
      Code.expect(result.company).to.equal(credentialsA.user.company[0].company)
      Code.expect(result.edition).to.equal(linkB.editionId)
      Code.expect(result.attendee).to.equal(linkB.attendeeId)
      Code.expect(result.note).to.equal(linkB.note)

      done()
    })
  })

  lab.test('Create as user', (done) => {
    const options = {
      method: 'POST',
      url: `/company/${credentialsA.user.company[0].company}/link`,
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
      url: `/company/${credentialsA.user.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
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
      url: `/company/${credentialsA.user.company[0].company}/link`,
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
      url: `/company/${credentialsA.user.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)

      done()
    })
  })
})
