const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
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
  lab.before( async () => {
    const optionsA = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: userA
    }
    const optionsB = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: userB
    }
    const optionsC = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: userC
    }
    const optionsD = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: userD
    }
    const optionsTeam = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: userTeam
    }
    const optionsAchievementA = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: achievementA
    }
    const optionsAchievementD = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: achievementD
    }

    
    await server.inject(optionsA)
    await server.inject(optionsB)
    await server.inject(optionsC)
    await server.inject(optionsD)
    await server.inject(optionsTeam)
    await server.inject(optionsAchievementA)
    await server.inject(optionsAchievementD)
  })

  lab.after( async () => {
    const optionsA = {
      method: 'DELETE',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsB = {
      method: 'DELETE',
      url: '/users/' + userB.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsC = {
      method: 'DELETE',
      url: '/users/' + userC.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsD = {
      method: 'DELETE',
      url: '/users/' + userD.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsTeam = {
      method: 'DELETE',
      url: '/users/' + userTeam.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsAchievementA = {
      method: 'DELETE',
      url: '/achievements/' + achievementA.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsAchievementD = {
      method: 'DELETE',
      url: '/achievements/' + achievementD.id,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }

    
    await server.inject(optionsA)
    await server.inject(optionsB)
    await server.inject(optionsC)
    await server.inject(optionsD)
    await server.inject(optionsTeam)
    await server.inject(optionsAchievementA)
    await server.inject(optionsAchievementD)
  })

  lab.test('Create link ok as company',  async () => {
    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/link`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: linkA
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(201)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.user).to.equal(linkA.userId)
    Code.expect(result.company).to.equal(userA.company[0].company)
    Code.expect(result.edition).to.equal(linkA.editionId)
    Code.expect(result.attendee).to.equal(linkA.attendeeId)
    Code.expect(result.notes.otherObservations).to.equal(linkA.notes.otherObservations)

  })

  lab.test('Create Link empty string as company',  async () => {
    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/link`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: linkC
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(201)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.user).to.equal(linkC.userId)
    Code.expect(result.company).to.equal(userA.company[0].company)
    Code.expect(result.edition).to.equal(linkC.editionId)
    Code.expect(result.attendee).to.equal(linkC.attendeeId)
    Code.expect(result.notes.otherObservations).to.be.empty()
  })

  lab.test('Create Link null note as company',  async () => {
    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/link`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: linkB
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(201)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.user).to.equal(linkB.userId)
    Code.expect(result.company).to.equal(userA.company[0].company)
    Code.expect(result.edition).to.equal(linkB.editionId)
    Code.expect(result.attendee).to.equal(linkB.attendeeId)
    Code.expect(result.notes).to.be.instanceof(Object)

  })

  lab.test('Sign B as company I day I',  async () => {
    const sign = {
      editionId: '25-SINFO',
      day: 'Monday'
    }

    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/sign/${userB.id}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: sign
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.signatures[0].edition).to.equal(sign.editionId)
    Code.expect(result.signatures[0].day).to.equal(sign.day)
    Code.expect(result.signatures[0].signatures.filter(s => s.companyId === userA.company[0].company).length).to.equal(1)

      
  })

  lab.test('Sign B as company II day I',  async () => {
    const sign = {
      editionId: '25-SINFO',
      day: 'Monday'
    }

    const options = {
      method: 'POST',
      url: `/company/${userD.company[0].company}/sign/${userB.id}`,
      auth:{
        credentials: credentialsD,
        strategy: 'default'
      },
      payload: sign
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.signatures[0].edition).to.equal(sign.editionId)
    Code.expect(result.signatures[0].day).to.equal(sign.day)
    Code.expect(result.signatures[0].signatures.filter(s => s.companyId === userA.company[0].company).length).to.equal(1)      
  })

  lab.test('Sign B as company I day II',  async () => {
    const sign = {
      editionId: '25-SINFO',
      day: 'Thursday'
    }

    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/sign/${userB.id}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: sign
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.signatures[1].edition).to.equal(sign.editionId)
    Code.expect(result.signatures[1].day).to.equal(sign.day)
    Code.expect(result.signatures[1].signatures.filter(s => s.companyId === userA.company[0].company).length).to.equal(1)

  })

  lab.test('Redeem Card day II as User',  async () => {
    const options = {
      method: 'POST',
      url: `/users/${userB.id}/redeem-card`,
      auth:{
        credentials: credentialsTeam,
        strategy: 'default'
      },
      payload: {
        day: 'Thursday',
        editionId: '25-SINFO'
      }
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(422)
  })

  lab.test('Get as company',  async () => {
    const options = {
      method: 'Get',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.user).to.equal(linkA.userId)
    Code.expect(result.company).to.equal(userA.company[0].company)
    Code.expect(result.edition).to.equal(linkA.editionId)
    Code.expect(result.attendee).to.equal(linkA.attendeeId)
    Code.expect(result.notes.otherObservations).to.equal(linkA.notes.otherObservations)

  })

  lab.test('Get other company as company',  async () => {
    const options = {
      method: 'Get',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsC,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(404)
      
  })

  lab.test('Update remove note as company',  async () => {
    const options = {
      method: 'PUT',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: { notes: null }
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.user).to.equal(linkA.userId)
    Code.expect(result.company).to.equal(userA.company[0].company)
    Code.expect(result.edition).to.equal(linkA.editionId)
    Code.expect(result.attendee).to.equal(linkA.attendeeId)
    Code.expect(result.notes.otherObservations).to.equal('')
  
  })

  lab.test('Update as company',  async () => {
    const options = {
      method: 'PUT',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: changesToA
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.user).to.equal(linkA.userId)
    Code.expect(result.company).to.equal(userA.company[0].company)
    Code.expect(result.edition).to.equal(linkA.editionId)
    Code.expect(result.attendee).to.equal(linkA.attendeeId)
    Code.expect(result.notes.otherObservations).to.equal(changesToA.notes.otherObservations)
  })

  lab.test('Update Non Existing as company',  async () => {
    const options = {
      method: 'PUT',
      url: `/company/NullConsulting/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: changesToA
    }

    server.inject(options)
    Code.expect(response.statusCode).to.equal(404)
  
  })

  lab.test('List as company',  async () => {
    const options = {
      method: 'Get',
      url: `/company/${userA.company[0].company}/link?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Array)
    Code.expect(result[0].user).to.equal(linkA.userId)
    Code.expect(result[0].company).to.equal(userA.company[0].company)

  })

  lab.test('List Non Existing as company',  async () => {
    const options = {
      method: 'Get',
      url: `/company/NullConsulting/link?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(404)
      
  })

  lab.test('Create same as company',  async () => {
    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/link`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: linkA
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(409)
  })

  lab.test('Delete A as company',  async () => {
    const options = {
      method: 'DELETE',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.user).to.equal(linkA.userId)
    Code.expect(result.company).to.equal(userA.company[0].company)
    Code.expect(result.edition).to.equal(linkA.editionId)
    Code.expect(result.attendee).to.equal(linkA.attendeeId)
    Code.expect(result.notes.otherObservations).to.equal(changesToA.notes.otherObservations)
  })

  lab.test('Delete B as company',  async () => {
    const options = {
      method: 'DELETE',
      url: `/company/${userA.company[0].company}/link/${linkB.attendeeId}?editionId=${linkB.editionId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
      
  })

  lab.test('Delete C as company',  async () => {
    const options = {
      method: 'DELETE',
      url: `/company/${userA.company[0].company}/link/${linkC.attendeeId}?editionId=${linkC.editionId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
      
  })

  lab.test('Create as user',  async () => {
    const options = {
      method: 'POST',
      url: `/company/${userA.company[0].company}/link`,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
      payload: linkA
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)

  })

  lab.test('Get as user',  async () => {
    const options = {
      method: 'GET',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
  })

  lab.test('List as user',  async () => {
    const options = {
      method: 'GET',
      url: `/company/${userA.company[0].company}/link?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
  })

  lab.test('Delete as user',  async () => {
    const options = {
      method: 'GET',
      url: `/company/${userA.company[0].company}/link/${linkA.attendeeId}?editionId=${linkA.editionId}`,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)

  })
})
