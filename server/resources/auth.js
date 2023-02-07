const server = require('../').hapi
const Boom = require('@hapi/boom')
const log = require('../helpers/logger')
const token = require('../auth/token')
const facebook = require('../helpers/facebook')
const google = require('../helpers/google')
const fenix = require('../helpers/fenix')
const linkedin = require('../helpers/linkedin')
const microsoft = require('../helpers/microsoft')

server.method('auth.facebook', facebookAuth, {})
server.method('auth.fenix', fenixAuth, {})
server.method('auth.google', googleAuth, {})
server.method('auth.linkedin', linkedinAuth, {})
server.method('auth.microsoft', microsoftAuth, {})

async function facebookAuth(id, token) {
  try {
    // Check with Facebook if token is valid
    await facebook.verifyToken(id, token)
    // Get user profile information from Facebook
    let fbUser = await facebook.getFacebookUser(token)
    // Get user in cannon by Facebook User email
    let res = await facebook.getUser(fbUser)
    // If user does not exist we create, otherwise we update existing user
    if (res.createUser) {
      let userId = await facebook.createUser(fbUser)
      await authenticate(userId, null)
    }
    const changedAttributes = {
      facebook: {
        id: fbUser.id
      },
      name: fbUser.name,
      img: fbUser.picture
    }
    return await authenticate(res.userId, changedAttributes)
  }
  catch (err) {
    Boom.unauthorized(err)
  }
}

async function googleAuth(id, token) {
  // Check with Google if token is valid
  let gUser = await google.verifyToken(id, token)
  // Get user in cannon by Google User email
  let res = await google.getUser(gUser)

  // If user does not exist we create, otherwise we update existing user
  if (res.createUser) {
    let userId = await google.createUser(gUser)
    return await authenticate(userId, null)
  }

  const changedAttributes = {
    google: {
      id: gUser.sub
    },
    name: gUser.name,
    img: gUser.picture
  }
  
  return await authenticate(res.userId, changedAttributes)
}

async function microsoftAuth(code) {
  try {
    const token = await microsoft.getToken(code)
    // Get Microsoft User
    const microsoftUser = await microsoft.getMicrosoftUser(token)
    // Get user in cannon by Microsoft User mail
    const res = await microsoft.getUser(microsoftUser)
    // If the user does not exist we create, otherwise we update the existing user
    if (res.createUser) {
      const userId = microsoft.createUser(microsoftUser)
      authenticate(userId, null)
    }

    const changedAttributes = {
      microsoft: {
        id: microsoftUser.id
      },
      name: microsoftUser.displayName,
      mail: microsoft.getEmail(microsoftUser),
      img: ''
    }

    return await authenticate(res.userId, changedAttributes)
  } catch(err) {
    Boom.unauthorized(err)
  }
  
}

async function fenixAuth(code) {
  try {
    // Exchange the code given by the user by a token from Fenix
    let token = await fenix.getToken(code)
    // Get user profile information from Fenix
    let fenixUser = await fenix.getFenixUser(token)
    // Get user in cannon by Fenix User email
    let res = await fenix.getUser(fenixUser)
    // If user does not exist we create, otherwise we update existing user
    if (res.createUser) {
      let userId = fenix.createUser(fenixUser)
      authenticate(userId, null)
    }

    const changedAttributes = {
      fenix: {
        id: fenixUser.username
      },
      name: fenixUser.name,
      img: `https://fenix.tecnico.ulisboa.pt/user/photo/${fenixUser.username}`
    }
    
    return authenticate(res.userId, changedAttributes)
  } catch (err) {
    Boom.unauthorized(err)
  }
}

async function linkedinAuth(code) {
  // Exchange the code given by the user by a token from Linkedin
  let token = await linkedin.getToken(code)
  // Get user profile information from Linkedin
  let linkedinUser = await linkedin.getLinkedinUser(token)
  // Get user in cannon by Linkedin User email
  let res = await linkedin.getUser(linkedinUser)
  // If user does not exist we create, otherwise we update existing user
  if (res.createUser) {
    let userId = await linkedin.createUser(linkedinUser)
    return await authenticate(userId, null)
  }
  const changedAttributes = {
    linkedin: {
      id: linkedinUser.id
    },
    name: `${linkedinUser.firstName} ${linkedinUser.lastName}`,
    mail: linkedinUser.emailAddress,
    img: linkedinUser.pictureUrl
  }
  return authenticate(res.userId, changedAttributes)
}

async function authenticate(userId, changedAttributes) {
  log.info('authenticate')
  const newToken = token.createJwt(userId)
  if (changedAttributes != null) {
    changedAttributes = { $set: changedAttributes }
    await server.methods.user.update({ id: userId }, changedAttributes)
  }
  log.info({ userId }, '[login] user logged in')
  // Finally resolves a new JWT token from Cannon that authenticates the user on the following requests
  log.info('authenticate done')
  return newToken
}