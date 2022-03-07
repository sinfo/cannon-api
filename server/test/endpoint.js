const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const auxAdmin = token.createJwt('john.doe')
const auxCompany = token.createJwt('tuda.chavaile')
const auxCompanyMalvino = token.createJwt('malvino')
const auxUser = token.createJwt('jane.doe')

const userAdmin = {
  id: 'john.doe',
  name: 'John Doe',
  mail: 'john@doe.com'
}

const credentialsAdmin = {
  user: {
    id: userAdmin.id,
    name: userAdmin.name
  },
  bearer: auxAdmin.token,
    scope: 'admin'
  }

const userCompany = {
  id: 'tuda.chavaile',
  name: 'Tuda Chavaile',
  mail: 'tuda@chavaile.com',
  role: 'company',
  company: [{
    edition: '25-SINFO',
    company: 'chavaile-consulting'
  }]
}

const credentialsCompany = {
  user: userCompany,
  bearer: auxCompany.token,
  scope: 'company'
}

const userCompanyMalvino = {
  id: 'malvino',
  name: 'Malvino Boy',
  mail: 'malvino@boy.com',
  role: 'company',
  company: [{
    edition: '25-SINFO',
    company: 'late-consulting'
  }]
}

const credentialsCompanyMalvino = {
  user: userCompanyMalvino,
  bearer: auxCompanyMalvino.token,
  scope: 'company'
}

const userUser = {
  id: 'jane.doe',
  name: 'Jane Doe',
  mail: 'jane@doe.com'
}

const credentialsUser = {
  user: userUser,
  bearer: auxUser.token,
  scope: 'user'
}

const fileA = {
  id: 'file4tests',
  user: 'jane.doe',
  name: 'readme',
  kind: 'important',
  extension: 'txt'
}

lab.experiment('Endpoint', () => {
  lab.before( async () => {
    const optionsAdmin = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: userAdmin
    }

    const optionsCompany = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: userCompany
    }

    const optionsUser = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: userUser
    }

    const optionsUserMalvino = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: userCompanyMalvino
    }
    const optionsLink = {
      method: 'POST',
      url: `/company/${userCompany.company[0].company}/link`,
      auth:{
        credentials: credentialsCompany,
        strategy: 'default'
      },
      payload: {
        attendeeId: userUser.id,
        editionId: '25-SINFO'
      }
    }
    const optionsFile = {
      method: 'POST',
      url: '/files',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: fileA
    }
    
    let response = await server.inject(optionsAdmin)
    Code.expect(response.statusCode).to.equal(201)
    response = await server.inject(optionsUser)
    Code.expect(response.statusCode).to.equal(201)
    response = await server.inject(optionsCompany)
    Code.expect(response.statusCode).to.equal(201)
    response = await server.inject(optionsUserMalvino)
    Code.expect(response.statusCode).to.equal(201)
    response = await server.inject(optionsLink)
    Code.expect(response.statusCode).to.equal(201)
    response = await server.inject(optionsFile)
    Code.expect(response.statusCode).to.equal(201)
  })

  lab.after( async () => {

    const optionsAdmin = {
      method: 'DELETE',
      url: `/users/${userAdmin.id}`,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }

    const optionsCompany = {
      method: 'DELETE',
      url: `/users/${userCompany.id}`,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }

    const optionsUser = {
      method: 'DELETE',
      url: `/users/${userUser.id}`,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsUserMalvino = {
      method: 'DELETE',
      url: `/users/${userCompanyMalvino.id}`,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }
    const optionsLink = {
      method: 'DELETE',
      url: `/company/${userCompany.company[0].company}/link/${userUser.id}?editionId=25-SINFO`,
      auth:{
        credentials: credentialsCompany,
        strategy: 'default'
      },
    }
    const optionsFile = {
      method: 'DELETE',
      url: `/files/${fileA.id}`,
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }

    
    await server.inject(optionsUser)
    await server.inject(optionsUserMalvino)
    await server.inject(optionsLink)
    await server.inject(optionsCompany)
    await server.inject(optionsFile)
    await server.inject(optionsAdmin)
  })

  lab.test('Create as an admin',  async () => {
    const from = new Date()
    const to = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000) // will be open for 2 weeks

    const options = {
      method: 'POST',
      url: '/company-endpoint',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: {
        companies: ['sinfo-consulting', 'chavaile-consulting'],
        edition: '25-SINFO',
        validity: {
          from,
          to // will be open for 2 weeks
        }
      }
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(201)
    Code.expect(result).to.be.instanceof(Array)
    Code.expect(result).to.have.length(2)

    let yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    options.payload = {
      companies: ['late-consulting'],
      edition: '25-SINFO',
      validity: {
        from: yesterday,
        to: yesterday
      }
    }
    response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(201)

  })

  lab.test('Create as a user',  async () => {
    const from = new Date()
    const to = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000) // will be open for 2 weeks

    const options = {
      method: 'POST',
      url: '/company-endpoint',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
      payload: {
        companies: ['sinfo-consulting', 'chavaile-consulting'],
        edition: '25-SINFO',
        validity: {
          from,
          to // will be open for 2 weeks
        }
      }
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
  })

  lab.test('List as an admin',  async () => {
    const options = {
      method: 'GET',
      url: '/company-endpoint?edition=25-SINFO',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Array)
    Code.expect(result).to.have.length(3)

  })

  lab.test('List as a user',  async () => {
    const options = {
      method: 'GET',
      url: '/company-endpoint',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('Get as an admin',  async () => {
    const options = {
      method: 'GET',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.company).to.equal('sinfo-consulting')
    Code.expect(result.edition).to.equal('25-SINFO')
    Code.expect(result.validity.from).to.be.date()
    Code.expect(result.validity.to).to.be.date()
  })

  lab.test('Get as a user',  async () => {
    const options = {
      method: 'GET',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('Update as an Admin',  async () => {
    const to = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    const options = {
      method: 'PUT',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
      payload: {
        validity: {
          to: to
        }
      }
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.company).to.equal('sinfo-consulting')
    Code.expect(result.edition).to.equal('25-SINFO')
    Code.expect(new Date(result.validity.to).toString()).to.equal(to.toString())
  })

  lab.test('Update as a User',  async () => {
    const to = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    const options = {
      method: 'PUT',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
      payload: {
        validity: {
          to
        }
      }
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
  })

  // lab.test('Get CVs as Company',  async () => {
  // const options = {
  // method: 'Get',
  // url: `/company/chavaile-consulting/files/download?editionId=25-SINFO`,
  // credentials: credentialsCompany
  // }

  // server.inject(options, (response) => {
  // Code.expect(response.statusCode).to.equal(200)
  // done()
  // })
  // })

  // lab.test('Get All CVs as Admin',  async () => {
  // const options = {
  // method: 'Get',
  // url: `/files/download?editionId=25-SINFO`,
  // credentials: credentialsAdmin
  // }

  // server.inject(options, (response) => {
  // Code.expect(response.statusCode).to.equal(200)
  // done()
  // })
  // })

  lab.test('Get All CVs as User',  async () => {
    const options = {
      method: 'Get',
      url: `/files/download?editionId=25-SINFO`,
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('Get All CVs as Company',  async () => {
    const options = {
      method: 'Get',
      url: `/files/download?editionId=25-SINFO`,
      auth:{
        credentials: credentialsCompany,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('Get CVs as Company Endpoint closed',  async () => {
    const options = {
      method: 'Get',
      url: `/company/late-consulting/files/download?editionId=25-SINFO`,
      auth:{
        credentials: credentialsCompanyMalvino,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(404)
  })

  // lab.test('Get Links CVs as Company',  async () => {
  // const options = {
  // method: 'Get',
  // url: `/company/chavaile-consulting/files/download?links=true&editionId=25-SINFO`,
  // credentials: credentialsCompany
  // }

  // server.inject(options, (response) => {
  // Code.expect(response.statusCode).to.equal(200)
  // done()
  // })
  // })

  lab.test('Get Links CVs as Other Company',  async () => {
    const options = {
      method: 'Get',
      url: `/company/chavaile-consulting/files/download?editionId=25-SINFO`,
      auth:{
        credentials: credentialsCompanyMalvino,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(404)
      
  })

  lab.test('Delete as a User',  async () => {
    const options = {
      method: 'DELETE',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      auth:{
        credentials: credentialsUser,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('Delete as an Admin',  async () => {
    const options = {
      method: 'DELETE',
      url: '/company-endpoint/sinfo-consulting?edition=25-SINFO',
      auth:{
        credentials: credentialsAdmin,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    options.url = '/company-endpoint/chavaile-consulting?edition=25-SINFO'
    response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    options.url = '/company-endpoint/late-consulting?edition=25-SINFO'
    response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })
})
