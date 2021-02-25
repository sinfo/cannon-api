const Lab = require('lab')
const Code = require('code')
const async = require('async')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const aux = token.createJwt('admin')
const auxA = token.createJwt('john.doe')
const auxB = token.createJwt('jane.doe')
const auxC = token.createJwt('conor.mcgregor')
const auxD = token.createJwt('tuda.chavaile')
const auxTeam = token.createJwt('johny.team')

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

const achievementA = {
  id: 'stand-' + userA.company[0].company + '-',
  name: 'Went to stand',
  kind: 'stand',
  value: 10,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  }
}

const userB = {
  id: 'jane.doe',
  name: 'Jane Doe',
  mail: 'jane@ufc.com',
  role: 'user'
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

const userD = {
  id: 'tuda.chavaile',
  name: 'Tudarete Chavaile',
  mail: 'tuda@chavaile.com',
  role: 'company',
  company: [{
    edition: '25-SINFO',
    company: 'Chavaile.Inc'
  }]
}

const achievementD = {
  id: 'stand-' + userD.company[0].company + '-',
  name: 'Went to stand',
  event: '25-SINFO',
  kind: 'stand',
  value: 10,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  }
}

const userTeam = {
  id: 'johny.team',
  name: 'johny team',
  mail: 'johny@sinfo.org',
  role: 'team'
}

const credentialsAdmin = {
  user: {
    id: 'admin',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'admin'
}

const credentialsA = {
  user: userA,
  bearer: auxA.token,
  scope: 'company'
}

const credentialsB = {
  user: userB,
  bearer: auxB.token,
  scope: 'user'
}

const credentialsC = {
  user: userC,
  bearer: auxC.token,
  scope: 'company'
}

const credentialsD = {
  user: userD,
  bearer: auxD.token,
  scope: 'company'
}

const credentialsTeam = {
  user: userTeam,
  bearer: auxTeam.token,
  scope: 'team'
}

const linkA = {
  userId: credentialsA.user.id,
  attendeeId: credentialsB.user.id,
  editionId: userA.company[0].edition,
  notes: {
    otherObservations: 'Jane had a great sence of humor'
  }
}

const linkB = {
  userId: credentialsA.user.id,
  attendeeId: credentialsD.user.id,
  editionId: userA.company[0].edition
}

const linkC = {
  userId: credentialsA.user.id,
  attendeeId: credentialsC.user.id,
  editionId: userA.company[0].edition,
  notes: { otherObservations: '' }
}
const changesToA = {
  notes: { otherObservations: 'Jane had a great sence of humor and great Perl skils' }
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
      payload: userB
    }
    const optionsC = {
      method: 'POST',
      url: '/users',
      credentials: credentialsAdmin,
      payload: userC
    }
    const optionsD = {
      method: 'POST',
      url: '/users',
      credentials: credentialsAdmin,
      payload: userD
    }
    const optionsTeam = {
      method: 'POST',
      url: '/users',
      credentials: credentialsAdmin,
      payload: userTeam
    }
    const optionsAchievementA = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsAdmin,
      payload: achievementA
    }
    const optionsAchievementD = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsAdmin,
      payload: achievementD
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
      },
      (cb) => {
        server.inject(optionsC, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsD, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsTeam, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsAchievementA, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsAchievementD, (response) => {
          return cb()
        })
      }
    ], (_, results) => {
      done()
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
      url: '/users/' + userB.id,
      credentials: credentialsAdmin
    }
    const optionsC = {
      method: 'DELETE',
      url: '/users/' + userC.id,
      credentials: credentialsAdmin
    }
    const optionsD = {
      method: 'DELETE',
      url: '/users/' + userD.id,
      credentials: credentialsAdmin
    }
    const optionsTeam = {
      method: 'DELETE',
      url: '/users/' + userTeam.id,
      credentials: credentialsAdmin
    }
    const optionsAchievementA = {
      method: 'DELETE',
      url: '/achievements/' + achievementA.id,
      credentials: credentialsAdmin
    }
    const optionsAchievementD = {
      method: 'DELETE',
      url: '/achievements/' + achievementD.id,
      credentials: credentialsAdmin
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
      },
      (cb) => {
        server.inject(optionsC, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsD, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsTeam, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsAchievementA, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsAchievementD, (response) => {
          return cb()
        })
      }
    ], (_, results) => {
      done()
    })
  })

  lab.test('Create link ok as company', (done) => {
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
      Code.expect(result.notes.otherObservations).to.equal(linkA.notes.otherObservations)

      done()
    })
  })

  lab.test('Create Link empty string as company', (done) => {
    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/link`,
      credentials: credentialsA,
      payload: linkC
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkC.userId)
      Code.expect(result.company).to.equal(userA.company[0].company)
      Code.expect(result.edition).to.equal(linkC.editionId)
      Code.expect(result.attendee).to.equal(linkC.attendeeId)
      Code.expect(result.notes.otherObservations).to.be.empty()

      done()
    })
  })

  lab.test('Create Link null note as company', (done) => {
    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/link`,
      credentials: credentialsA,
      payload: linkB
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkB.userId)
      Code.expect(result.company).to.equal(userA.company[0].company)
      Code.expect(result.edition).to.equal(linkB.editionId)
      Code.expect(result.attendee).to.equal(linkB.attendeeId)
      Code.expect(result.notes).to.be.instanceof(Object)

      done()
    })
  })

  lab.test('Sign B as company I day I', (done) => {
    const sign = {
      editionId: '25-SINFO',
      day: 'Monday'
    }

    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/sign/${userB.id}`,
      credentials: credentialsA,
      payload: sign
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.signatures[0].edition).to.equal(sign.editionId)
      Code.expect(result.signatures[0].day).to.equal(sign.day)
      Code.expect(result.signatures[0].signatures.filter(s => s.companyId === userA.company[0].company).length).to.equal(1)

      done()
    })
  })

  lab.test('Sign B as company II day I', (done) => {
    const sign = {
      editionId: '25-SINFO',
      day: 'Monday'
    }

    const options = {
      method: 'POST',
      url: `/company/${userD.company[0].company}/sign/${userB.id}`,
      credentials: credentialsD,
      payload: sign
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.signatures[0].edition).to.equal(sign.editionId)
      Code.expect(result.signatures[0].day).to.equal(sign.day)
      Code.expect(result.signatures[0].signatures.filter(s => s.companyId === userA.company[0].company).length).to.equal(1)

      done()
    })
  })

  lab.test('Sign B as company I day II', (done) => {
    const sign = {
      editionId: '25-SINFO',
      day: 'Thursday'
    }

    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/sign/${userB.id}`,
      credentials: credentialsA,
      payload: sign
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.signatures[1].edition).to.equal(sign.editionId)
      Code.expect(result.signatures[1].day).to.equal(sign.day)
      Code.expect(result.signatures[1].signatures.filter(s => s.companyId === userA.company[0].company).length).to.equal(1)

      done()
    })
  })

  lab.test('Redeem Card day II as User', (done) => {
    const options = {
      method: 'POST',
      url: `/users/${userB.id}/redeem-card`,
      credentials: credentialsTeam,
      payload: {
        day: 'Thursday',
        editionId: '25-SINFO'
      }
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(422)
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
      Code.expect(result.notes.otherObservations).to.equal(linkA.notes.otherObservations)

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
      payload: { notes: null }
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.user).to.equal(linkA.userId)
      Code.expect(result.company).to.equal(userA.company[0].company)
      Code.expect(result.edition).to.equal(linkA.editionId)
      Code.expect(result.attendee).to.equal(linkA.attendeeId)
      Code.expect(result.notes.otherObservations).to.equal('')

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
      Code.expect(result.notes.otherObservations).to.equal(changesToA.notes.otherObservations)

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
      // result.sort()

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result[0].user).to.equal(linkA.userId)
      Code.expect(result[0].company).to.equal(userA.company[0].company)

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
      Code.expect(result.notes.otherObservations).to.equal(changesToA.notes.otherObservations)

      done()
    })
  })
  lab.test('Delete B as company', (done) => {
    const options = {
      method: 'DELETE',
      url: `/company/${userA.company[0].company}/link/${linkB.attendeeId}?editionId=${linkB.editionId}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200)
      done()
    })
  })
  lab.test('Delete C as company', (done) => {
    const options = {
      method: 'DELETE',
      url: `/company/${userA.company[0].company}/link/${linkC.attendeeId}?editionId=${linkC.editionId}`,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200)
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
