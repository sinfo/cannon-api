const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const AchievementKind = require('../db/achievementKind')

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

const achievementStand1 = {
  name: 'Stand 1',
  id: 'stand-sinfo-consulting-1',
  value: 10,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  },
  kind: AchievementKind.STAND
}

const achievementStand2 = {
  name: 'Stand 1',
  id: 'stand-sinfo-engineering-1',
  value: 10,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  },
  kind: AchievementKind.STAND
}

const achievementDay = {
  name: 'TOTAL DAY',
  id: 'totalday',
  value: 500,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  },
  kind: AchievementKind.STANDDAY
}

lab.experiment('Sign', () => {
  lab.before( async () => {
    const optionsA = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: userCompany
    }
    const optionsB = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: attendee
    }
    const optionsC = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: speedDate1
    }
    const optionsD = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: speedDate2
    }
    const optionsE = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: achievementDay
    }
    const optionsF = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: achievementStand1
    }
    const optionsG = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: achievementStand2
    }
    const optionsH = {
      method: 'PUT',
      url: '/users/' + userCompany.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: promoteToCompanyA
    }

    
    await server.inject(optionsA)
    await server.inject(optionsB)
    await server.inject(optionsC)
    await server.inject(optionsD)
    await server.inject(optionsE)
    await server.inject(optionsF)
    await server.inject(optionsG)
    await server.inject(optionsH)
  })

  lab.after( async () => {
    const optionsA = {
      method: 'DELETE',
      url: '/users/' + userCompany.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsB = {
      method: 'DELETE',
      url: '/users/' + attendee.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsAchievementA = {
      method: 'DELETE',
      url: '/achievements/' + speedDate1.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsAchievementB = {
      method: 'DELETE',
      url: '/achievements/' + speedDate2.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsAchievementC = {
      method: 'DELETE',
      url: '/achievements/' + achievementStand1.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsAchievementD = {
      method: 'DELETE',
      url: '/achievements/' + achievementStand2.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsAchievementE = {
      method: 'DELETE',
      url: '/achievements/' + achievementDay.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    await server.inject(optionsA)
    await server.inject(optionsB)
    await server.inject(optionsAchievementA)
    await server.inject(optionsAchievementB)
    await server.inject(optionsAchievementC)
    await server.inject(optionsAchievementD)
    await server.inject(optionsAchievementE)
    await happyHour.findOneAndRemove({})
  })

  lab.test('Sign into speed date once',  async () => {
    const optionsA = {
      method: 'POST',
      url: `/company/${promoteToCompanyA.company.company}/speed/${attendee.id}`,
      auth:{
        credentials: credentialsCompany,
        strategy: 'default'
      },
      payload: {editionId: event}
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/speed/me',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    let response= await server.inject(optionsA)
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.id).to.equal(speedDate1.id)
    Code.expect(result.users).to.contain(attendee.id)

    response= await server.inject(optionsB)
    result = response.result

    const filtered = result.achievements.filter(achievement => achievement.achievement.id === speedDate1.id)

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.achievements.length).to.equal(2)
    Code.expect(filtered.length).to.equal(1)
    Code.expect(filtered[0].frequence).to.equal(1)
    Code.expect(result.points).to.equal(speedDate1.value)
  })

  lab.test('Sign into speed date twice',  async () => {
    const optionsA = {
      method: 'POST',
      url: `/company/${promoteToCompanyA.company.company}/speed/${attendee.id}`,
      auth:{
        credentials: credentialsCompany,
        strategy: 'default'
      },
      payload: {editionId: event}
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/speed/me',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    let response = await server.inject(optionsA)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.id).to.equal(speedDate1.id)
    Code.expect(result.users).to.contain(attendee.id)

    response = await server.inject(optionsB)
    result = response.result

    const filtered = result.achievements.filter(achievement => achievement.achievement.id === speedDate1.id)

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.achievements.length).to.equal(2)
    Code.expect(filtered.length).to.equal(1)
    Code.expect(filtered[0].frequence).to.equal(2)
    Code.expect(result.points).to.equal(speedDate1.value + speedDate1.value / 2)
  })

  lab.test('Sign into speed date thrice',  async () => {
    const optionsA = {
      method: 'POST',
      url: `/company/${promoteToCompanyA.company.company}/speed/${attendee.id}`,
      auth:{
        credentials: credentialsCompany,
        strategy: 'default'
      },
      payload: {editionId: event}
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/speed/me',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    let response = await server.inject(optionsA)
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.id).to.equal(speedDate1.id)
    Code.expect(result.users).to.contain(attendee.id)

    response = await server.inject(optionsB)
    result = response.result

    const filtered = result.achievements.filter(achievement => achievement.achievement.id === speedDate1.id)

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.achievements.length).to.equal(2)
    Code.expect(filtered.length).to.equal(1)
    Code.expect(filtered[0].frequence).to.equal(3)
    Code.expect(result.points).to.equal(speedDate1.value + speedDate1.value / 2 + speedDate1.value / 4)
  })

  lab.test('Sign into speed date 4 times',  async () => {
    const optionsA = {
      method: 'POST',
      url: `/company/${promoteToCompanyA.company.company}/speed/${attendee.id}`,
      auth:{
        credentials: credentialsCompany,
        strategy: 'default'
      },
      payload: {editionId: event}
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/speed/me',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    let response = await server.inject(optionsA)
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.id).to.equal(speedDate1.id)
    Code.expect(result.users).to.contain(attendee.id)

    response = await server.inject(optionsB)
    result = response.result

    const filtered = result.achievements.filter(achievement => achievement.achievement.id === speedDate1.id)

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.achievements.length).to.equal(2)
    Code.expect(filtered.length).to.equal(1)
    Code.expect(filtered[0].frequence).to.equal(3)
    Code.expect(result.points).to.equal(speedDate1.value + speedDate1.value / 2 + speedDate1.value / 4)
  })

  lab.test('Sign into stand 1',  async () => {
    const optionsA = {
      method: 'POST',
      url: `/company/${promoteToCompanyA.company.company}/sign/${attendee.id}`,
      auth:{
        credentials: credentialsCompany,
        strategy: 'default'
      },
      payload: {editionId: event, day: 'Monday'}
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/active/me',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    let response = await server.inject(optionsA)
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.signatures[0].edition).to.equal(event)
    Code.expect(result.signatures[0].signatures.filter(s => s.companyId === promoteToCompanyA.company.company).length).to.equal(1)

    response = await server.inject(optionsB)
    result = response.result

    const filtered = result.achievements.filter(a => a.id === achievementStand1.id)

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(filtered.length).to.equal(1)
    Code.expect(result.points).to.equal(achievementStand1.value)

  })

  lab.test('Sign into all stands',  async () => {
    const optionsA = {
      method: 'PUT',
      url: '/users/' + userCompany.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: promoteToCompanyB
    }
    const optionsB = {
      method: 'POST',
      url: `/company/${promoteToCompanyB.company.company}/sign/${attendee.id}`,
      auth:{
        credentials: credentialsCompany,
        strategy: 'default'
      },
      payload: {editionId: event, day: 'Monday'}
    }

    const optionsC = {
      method: 'GET',
      url: '/achievements/active/me',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    let response = await server.inject(optionsA)
    Code.expect(response.statusCode).to.equal(200)

    response = await server.inject(optionsB)
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.signatures[0].edition).to.equal(event)
    Code.expect(result.signatures[0].signatures.filter(s => s.companyId === promoteToCompanyB.company.company).length).to.equal(1)
    
    response = await server.inject(optionsC)
    result = response.result

    const filtered = result.achievements.filter(a => a.id === achievementStand1.id)

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(filtered.length).to.equal(1)
    Code.expect(result.points).to.equal(achievementStand1.value + achievementStand2.value + achievementDay.value)

  })

  lab.test('Get total speed dating points',  async () => {
    const optionsA = {
      from: new Date(new Date().getTime() - (1000 * 60 * 60)), // -1 h
      to: new Date(new Date().getTime() + (1000 * 60 * 60)) // +1 h
    }

    const optionsB = {
      method: 'POST',
      url: `/company/${promoteToCompanyB.company.company}/speed/${attendee.id}`,
      auth:{
        credentials: credentialsCompany,
        strategy: 'default'
      },
      payload: {editionId: event}
    }

    const optionsC = {
      method: 'GET',
      url: '/achievements/speed/me',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    await happyHour.create(optionsA).catch( (err) =>{
        Code.expect(err).to.be.null
      }
    )

    let response = await server.inject(optionsB)
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(speedDate2.id)
    Code.expect(result.users).to.contain(attendee.id)

    response = await server.inject(optionsC)
    result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.achievements.length).to.equal(2)
    Code.expect(result.points).to.equal(speedDate1.value + speedDate1.value / 2 + speedDate1.value / 4 + speedDate2.value + speedDate2.value / 2 + speedDate2.value / 4)
          
  })
})

