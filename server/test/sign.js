const Lab = require('lab')
const Code = require('code')
const async = require('async')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')
const happyHour = require('../db/happy-hour')

const adminId = 'john.doe'
const companyId = 'john.smith'
const attendeeId = 'jane.doe'

const tokenA = token.createJwt(adminId)
const tokenB = token.createJwt(companyId)
const tokenC = token.createJwt(attendeeId)

const event = 'sinfoX'

const credentialsAdmin = {
  user: {
    id: adminId,
    name: 'John Doe'
  },
  bearer: tokenA.token,
  scope: 'admin'
}

const credentialsCompany = {
  user: {
    id: companyId,
    name: 'John Smith'
  },
  bearer: tokenB.token,
  scope: 'company'
}

const credentialsUser = {
  user: {
    id: attendeeId,
    name: 'Jane Doe'
  },
  bearer: tokenC.token,
  scope: 'user'
}

const userCompany = {
  id: companyId,
  name: 'John Smith',
  mail: 'john@smith.com'
}

const attendee = {
  id: attendeeId,
  name: 'Jane Doe',
  mail: 'jane@doe.com'
}

const promoteToCompanyA = {
  role: 'company',
  company: {
    edition: event,
    company: 'sinfo-consulting'
  }
}

const promoteToCompanyB = {
  role: 'company',
  company: {
    edition: event,
    company: 'sinfo-engineering'
  }
}

const speedDate1 = {
  id: 'speedDate-sinfo-consulting-1',
  name: 'SPEED DATE 1',
  event: event,
  value: 20,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  },
  kind: 'speedDate'
}

const speedDate2 = {
  id: 'speedDate-sinfo-engineering-1',
  name: 'SPEED DATE 2',
  event: event,
  value: 20,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  },
  kind: 'speedDate'
}

lab.experiment('Sign', () => {
  lab.before((done) => {
    const optionsA = {
      method: 'POST',
      url: '/users',
      credentials: credentialsAdmin,
      payload: userCompany
    }
    const optionsB = {
      method: 'POST',
      url: '/users',
      credentials: credentialsAdmin,
      payload: attendee
    }
    const optionsC = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsAdmin,
      payload: speedDate1
    }
    const optionsD = {
      method: 'PUT',
      url: '/users/' + userCompany.id,
      credentials: credentialsAdmin,
      payload: promoteToCompanyA
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
      }
    ], (_, results) => {
      done()
    })
  })

  lab.after((done) => {
    const optionsA = {
      method: 'DELETE',
      url: '/users/' + userCompany.id,
      credentials: credentialsAdmin
    }
    const optionsB = {
      method: 'DELETE',
      url: '/users/' + attendee.id,
      credentials: credentialsAdmin
    }
    const optionsAchievementA = {
      method: 'DELETE',
      url: '/achievements/' + speedDate1.id,
      credentials: credentialsAdmin
    }
    const optionsAchievementB = {
      method: 'DELETE',
      url: '/achievements/' + speedDate2.id,
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
        server.inject(optionsAchievementA, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsAchievementB, (response) => {
          return cb()
        })
      },
      (cb) => {
        happyHour.findOneAndRemove({}, (err, hh) => {
          if (!err) {
            return cb()
          }
        })
      }
    ], (_, results) => {
      done()
    })
  })

  lab.test('Sign into speed date once', (done) => {
    const optionsA = {
      method: 'POST',
      url: `/company/${promoteToCompanyA.company.company}/speed/${attendee.id}`,
      credentials: credentialsCompany,
      payload: {editionId: event}
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/speed/me',
      credentials: credentialsUser
    }

    server.inject(optionsA, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result.id).to.equal(speedDate1.id)
      Code.expect(result.users).to.contain(attendee.id)

      server.inject(optionsB, (response) => {
        const result = response.result

        Code.expect(response.statusCode).to.equal(200)
        Code.expect(result.achievements.length).to.equal(1)
        Code.expect(result.achievements[0].achievement.id).to.equal(speedDate1.id)
        Code.expect(result.achievements[0].frequence).to.equal(1)
        Code.expect(result.points).to.equal(speedDate1.value)

        done()
      })
    })
  })

  lab.test('Sign into speed date twice', (done) => {
    const optionsA = {
      method: 'POST',
      url: `/company/${promoteToCompanyA.company.company}/speed/${attendee.id}`,
      credentials: credentialsCompany,
      payload: {editionId: event}
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/speed/me',
      credentials: credentialsUser
    }

    server.inject(optionsA, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result.id).to.equal(speedDate1.id)
      Code.expect(result.users).to.contain(attendee.id)

      server.inject(optionsB, (response) => {
        const result = response.result

        Code.expect(response.statusCode).to.equal(200)
        Code.expect(result.achievements.length).to.equal(1)
        Code.expect(result.achievements[0].achievement.id).to.equal(speedDate1.id)
        Code.expect(result.achievements[0].frequence).to.equal(2)
        Code.expect(result.points).to.equal(speedDate1.value + speedDate1.value / 2)

        done()
      })
    })
  })

  lab.test('Sign into speed date thrice', (done) => {
    const optionsA = {
      method: 'POST',
      url: `/company/${promoteToCompanyA.company.company}/speed/${attendee.id}`,
      credentials: credentialsCompany,
      payload: {editionId: event}
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/speed/me',
      credentials: credentialsUser
    }

    server.inject(optionsA, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result.id).to.equal(speedDate1.id)
      Code.expect(result.users).to.contain(attendee.id)

      server.inject(optionsB, (response) => {
        const result = response.result

        Code.expect(response.statusCode).to.equal(200)
        Code.expect(result.achievements.length).to.equal(1)
        Code.expect(result.achievements[0].achievement.id).to.equal(speedDate1.id)
        Code.expect(result.achievements[0].frequence).to.equal(3)
        Code.expect(result.points).to.equal(speedDate1.value + speedDate1.value / 2 + speedDate1.value / 4)

        done()
      })
    })
  })

  lab.test('Sign into speed date 4 times', (done) => {
    const optionsA = {
      method: 'POST',
      url: `/company/${promoteToCompanyA.company.company}/speed/${attendee.id}`,
      credentials: credentialsCompany,
      payload: {editionId: event}
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/speed/me',
      credentials: credentialsUser
    }

    server.inject(optionsA, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result.id).to.equal(speedDate1.id)
      Code.expect(result.users).to.contain(attendee.id)

      server.inject(optionsB, (response) => {
        const result = response.result

        Code.expect(response.statusCode).to.equal(200)
        Code.expect(result.achievements.length).to.equal(1)
        Code.expect(result.achievements[0].achievement.id).to.equal(speedDate1.id)
        Code.expect(result.achievements[0].frequence).to.equal(3)
        Code.expect(result.points).to.equal(speedDate1.value + speedDate1.value / 2 + speedDate1.value / 4)

        done()
      })
    })
  })

  lab.test('Get total speed dating points', (done) => {
    const optionsHH = {
      from: new Date(new Date().getTime() - (1000 * 60 * 60)), // -1 h
      to: new Date(new Date().getTime() + (1000 * 60 * 60)) // +1 h
    }
    const optionsA = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsAdmin,
      payload: speedDate2
    }
    const optionsB = {
      method: 'PUT',
      url: '/users/' + userCompany.id,
      credentials: credentialsAdmin,
      payload: promoteToCompanyB
    }
    const optionsC = {
      method: 'POST',
      url: `/company/${promoteToCompanyB.company.company}/speed/${attendee.id}`,
      credentials: credentialsCompany,
      payload: {editionId: event}
    }

    const optionsD = {
      method: 'GET',
      url: '/achievements/speed/me',
      credentials: credentialsUser
    }

    happyHour.create(optionsHH, (err, hh) => {
      Code.expect(err).to.be.null
      server.inject(optionsA, (response) => {
        const result = response.result

        Code.expect(response.statusCode).to.equal(201)
        Code.expect(result).to.be.instanceof(Object)
        Code.expect(result.id).to.equal(speedDate2.id)

        server.inject(optionsB, (response) => {
          Code.expect(response.statusCode).to.equal(200)

          server.inject(optionsC, (response) => {
            const result = response.result

            Code.expect(response.statusCode).to.equal(200)
            Code.expect(result).to.be.instanceof(Object)
            Code.expect(result.id).to.equal(speedDate2.id)
            Code.expect(result.users).to.contain(attendee.id)

            server.inject(optionsD, (response) => {
              const result = response.result

              Code.expect(response.statusCode).to.equal(200)
              Code.expect(result.achievements.length).to.equal(2)
              Code.expect(result.points).to.equal(speedDate1.value + speedDate1.value / 2 + speedDate1.value / 4 + speedDate2.value + speedDate2.value / 2 + speedDate2.value / 4)

              done()
            })
          })
        })
      })
    })
  })
})

