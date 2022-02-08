const Lab = require('lab')
const Code = require('code')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')
const AchievementKind = require('../db/achievementKind')

const aux = token.createJwt('john.doe')
const auxB = token.createJwt('jane.doe')
const async = require('async')

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

const credentialsD = {
  user: {
    id: 'jane.doe',
    name: 'Jane Doe'
  },
  bearer: auxB.token,
  scope: 'user'
}

let code = ''

const userA = {
  id: 'john.doe',
  name: 'John Doe',
  mail: 'john@doe.com'
}

const achievementId = 'WENT-TO-SINFO-XXII'
const achievementA = {
  name: 'WENT TO SINFO XXII',
  event: 'SINFO XXII',
  session: 'not', // HACK
  value: 10,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  }
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

const sessionA = 'sessionA'
const sessionB = 'sessionB'
const wsIdA = 'ws1'
const wsIdB = 'ws2'

const wsA = {
  name: 'WS A',
  event: 'SINFO 28',
  id: wsIdA,
  value: 10,
  session: sessionA,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60))
  },
  kind: AchievementKind.WORKSHOP
}

const wsB = {
  name: 'WS B',
  event: 'SINFO 28',
  id: wsIdB,
  value: 10,
  session: sessionB,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60))
  },
  kind: AchievementKind.WORKSHOP
}

let codewsA = ''
let codewsB = ''

lab.experiment('User', () => {
  lab.before('create ws', (done) => {
    const expires = new Date(new Date().getTime() + (1000 * 60 * 60))

    const optionsA = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsA,
      payload: wsA
    }

    const optionsB = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsA,
      payload: wsB
    }

    const optionsC = {
      method: 'POST',
      url: `/sessions/${sessionA}/generate`,
      credentials: credentialsA,
      payload: {expiration: expires}
    }

    const optionsD = {
      method: 'POST',
      url: `/sessions/${sessionB}/generate`,
      credentials: credentialsA,
      payload: {expiration: expires}
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
      async.parallel([
        (cb) => {
          server.inject(optionsC, (response) => {
            codewsA = response.result.code.code
            return cb()
          })
        },
        (cb) => {
          server.inject(optionsD, (response) => {
            codewsB = response.result.code.code
            return cb()
          })
        }
      ], (_, results) => {
        done()
      })
    })
  })

  lab.after('remove achievements', (done) => {
    const optionsA = {
      method: 'DELETE',
      url: '/achievements/' + achievementId,
      credentials: credentialsA
    }

    const optionsB = {
      method: 'DELETE',
      url: '/achievements/' + wsIdA,
      credentials: credentialsA
    }

    const optionsC = {
      method: 'DELETE',
      url: '/achievements/' + wsIdB,
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
      },
      (cb) => {
        server.inject(optionsC, (response) => {
          return cb()
        })
      }
    ], (_, results) => {
      done()
    })
  })

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

  lab.test('Block double concurrent workshop', (done) => {
    const optionsA = {
      method: 'POST',
      url: `/sessions/${sessionA}/check-in`,
      credentials: credentialsD,
      payload: {
        users: [credentialsD.user.id],
        code: codewsA
      }
    }

    const optionsB = {
      method: 'POST',
      url: `/sessions/${sessionB}/check-in`,
      credentials: credentialsD,
      payload: {
        users: [credentialsD.user.id],
        code: codewsB
      }
    }

    const optionsC = {
      method: 'GET',
      url: '/achievements/active/me',
      credentials: credentialsD
    }

    server.inject(optionsA, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(wsIdA)
      Code.expect(result.name).to.equal(wsA.name)
      Code.expect(result.users).to.contain(credentialsD.user.id)

      server.inject(optionsB, (response) => {
        Code.expect(response.statusCode).to.equal(403)

        server.inject(optionsC, (response) => {
          const result = response.result

          Code.expect(response.statusCode).to.equal(200)
          Code.expect(result.points).to.equal(0)
          Code.expect(result.achievements.length).to.equal(0)
          done()
        })
      })
    })
  })

  lab.test('Double sign in same workshop should not deduce points', (done) => {
    const optionsA = {
      method: 'POST',
      url: `/sessions/${sessionA}/check-in`,
      credentials: credentialsD,
      payload: {
        users: [credentialsD.user.id],
        code: codewsA
      }
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/active/me',
      credentials: credentialsD
    }

    server.inject(optionsA, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(wsIdA)
      Code.expect(result.name).to.equal(wsA.name)
      Code.expect(result.users).to.contain(credentialsD.user.id)

      server.inject(optionsA, (response) => {
        const result = response.result

        Code.expect(response.statusCode).to.equal(200)
        Code.expect(result).to.be.instanceof(Object)
        Code.expect(result.id).to.equal(wsIdA)
        Code.expect(result.name).to.equal(wsA.name)
        Code.expect(result.users).to.contain(credentialsD.user.id)

        server.inject(optionsB, (response) => {
          const result = response.result

          Code.expect(response.statusCode).to.equal(200)
          Code.expect(result.points).to.equal(wsA.value)
          Code.expect(result.achievements.length).to.equal(1)
          done()
        })
      })
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
      done()
    })
  })

  lab.test('List all with achievement as admin', (done) => {
    const opt1 = {
      method: 'GET',
      url: '/users',
      credentials: credentialsA
    }

    const opt2 = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsA,
      payload: achievementA
    }

    const opt3 = {
      method: 'POST',
      url: `/sessions/${achievementA.session}/check-in`,
      credentials: credentialsA,
      payload: { users: [userA.id] }
    }

    server.inject(opt2, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)

      server.inject(opt3, (response) => {
        Code.expect(response.statusCode).to.equal(200)

        server.inject(opt1, (response) => {
          const result = response.result

          Code.expect(response.statusCode).to.equal(200)
          Code.expect(result).to.be.instanceof(Array)
          Code.expect(result[0].name).to.be.string
          done()
        })
      })
    })
  })

  lab.test('Post code as admin and sign as user', (done) => {
    const expires = new Date(new Date().getTime() + (1000 * 60 * 60))

    const opt1 = {
      method: 'POST',
      url: `/sessions/${achievementA.session}/generate`,
      credentials: credentialsA,
      payload: {expiration: expires}
    }

    server.inject(opt1, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)
      Code.expect(new Date(result.code.expiration).toISOString()).to.equal(expires.toISOString())
      Code.expect(result.code.code.length).to.equal(12)

      code = result.code.code

      const opt2 = {
        method: 'POST',
        url: `/sessions/${achievementA.session}/check-in`,
        credentials: credentialsD,
        payload: {
          users: [credentialsD.user.id],
          code: code
        }
      }

      server.inject(opt2, (response) => {
        const result = response.result

        Code.expect(response.statusCode).to.equal(200)
        Code.expect(result).to.be.instanceof(Object)
        Code.expect(result.id).to.equal(achievementId)
        Code.expect(result.name).to.equal(achievementA.name)
        Code.expect(result.users).to.contain(credentialsD.user.id)
        done()
      })
    })
  })

  lab.test('Self sign fail', (done) => {
    const opt1 = {
      method: 'GET',
      url: `/achievements/${achievementId}`,
      credentials: credentialsA
    }

    server.inject(opt1, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)

      const opt2 = {
        method: 'POST',
        url: `/sessions/${achievementA.session}/check-in`,
        credentials: credentialsD,
        payload: {
          users: [credentialsD.user.id],
          code: 'bad'
        }
      }

      server.inject(opt2, (response) => {
        Code.expect(response.statusCode).to.equal(404)

        const opt3 = {
          method: 'POST',
          url: `/sessions/${achievementA.session}/check-in`,
          credentials: credentialsD,
          payload: {
            users: [credentialsA.user.id],
            code: code
          }
        }

        server.inject(opt3, (response) => {
          Code.expect(response.statusCode).to.equal(400)
          done()
        })
      })
    })
  })

  lab.test('Get one with codes', (done) => {
    const opt1 = {
      method: 'GET',
      url: `/achievements/${achievementId}/code`,
      credentials: credentialsA
    }

    const opt2 = {
      method: 'GET',
      url: `/achievements/${achievementId}/code`,
      credentials: credentialsB
    }

    const opt3 = {
      method: 'GET',
      url: `/achievements/${achievementId}/code`,
      credentials: credentialsC
    }

    server.inject(opt1, (response) => { // Admin
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)
      Code.expect(result.code).to.be.instanceof(Object)
      Code.expect(result.code.code).to.equal(code)

      server.inject(opt3, (response) => { // Team
        Code.expect(response.statusCode).to.equal(200)
        Code.expect(result).to.be.instanceof(Object)
        Code.expect(result.id).to.equal(achievementId)
        Code.expect(result.name).to.equal(achievementA.name)
        Code.expect(result.code).to.be.instanceof(Object)
        Code.expect(result.code.code).to.equal(code)

        server.inject(opt2, (response) => { // User
          Code.expect(response.statusCode).to.equal(403)
          done()
        })
      })
    })
  })

  lab.test('List with codes', (done) => {
    const start = new Date(achievementA.validity.from.getTime() - (1000 * 60 * 60))
    const end = new Date(achievementA.validity.to.getTime() + (1000 * 60 * 60))
    const query = `?start=${start}&end=${end}`
    const opt1 = {
      method: 'GET',
      url: `/achievements/code${query}`,
      credentials: credentialsA
    }

    const opt2 = {
      method: 'GET',
      url: `/achievements/code${query}`,
      credentials: credentialsB
    }

    const opt3 = {
      method: 'GET',
      url: `/achievements/code${query}`,
      credentials: credentialsC
    }

    server.inject(opt1, (response) => { // Admin
      const result = response.result

      const sorted = result.filter(elem => elem.id === achievementId)

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(sorted.length).to.equal(1)
      Code.expect(sorted[0].id).to.equal(achievementId)
      Code.expect(sorted[0].name).to.equal(achievementA.name)
      Code.expect(sorted[0].code).to.be.instanceof(Object)
      Code.expect(sorted[0].code.code).to.equal(code)

      server.inject(opt3, (response) => { // Team
        const result = response.result

        const sorted = result.filter(elem => elem.id === achievementId)

        Code.expect(response.statusCode).to.equal(200)
        Code.expect(result).to.be.instanceof(Array)
        Code.expect(sorted.length).to.equal(1)
        Code.expect(sorted[0].id).to.equal(achievementId)
        Code.expect(sorted[0].name).to.equal(achievementA.name)
        Code.expect(sorted[0].code).to.be.instanceof(Object)
        Code.expect(sorted[0].code.code).to.equal(code)

        server.inject(opt2, (response) => { // User
          Code.expect(response.statusCode).to.equal(403)
          done()
        })
      })
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
      payload: { role: 'user' }
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
      payload: { role: 'team' }
    }

    server.inject(options, (response) => {
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
