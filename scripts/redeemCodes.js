const server = require('../server').hapi
const API = server.methods

// ===================== edit here =====================

const REDEEM_CODES_NUMBER = 7
const EXPIRATION_DATE = new Date(2019, 02, 01)
const ACHIEVEMENT_VALUE = 20
const ACHIEVEMENT_DESCRIPTION = ''

// ===================== end of edit =====================

const ACHIEVEMENT_VALIDITY_FROM = new Date()
const ACHIEVEMENT_VALIDITY_TO = EXPIRATION_DATE
const ACHIEVEMENT_IMG = 'https://sinfo.ams3.cdn.digitaloceanspaces.com/static/26-sinfo/achievements/gamification.png'
const ACHIEVEMENT_KIND = 'other'
const ACHIEVEMENT_NAME = 'Discovered a secret!'

let pendingJobs = 0

function randomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 2; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function createAchievement() {
  let achievement = {
    name: ACHIEVEMENT_NAME,
    id: randomString(),
    kind: ACHIEVEMENT_KIND,
    value: ACHIEVEMENT_VALUE,
    img: ACHIEVEMENT_IMG,
    description: ACHIEVEMENT_DESCRIPTION,
    validity: {
      from: ACHIEVEMENT_VALIDITY_FROM,
      to: ACHIEVEMENT_VALIDITY_TO
    }
  }

  API.achievement.create(achievement, (err, result) => {
    if (err) {
      return console.error({err: err}, 'error creating an achievement')
    }

    console.log('+', 'ACHIEVEMENT', result.id, result.value)

    createRedeemCodes(result)
  })
}

function createRedeemCodes(achievement) {
  for (let i = 0; i < REDEEM_CODES_NUMBER; i++) {
    pendingJobs += 1

    API.redeem.create({
      id: randomString(),
      achievement: achievement.id,
      expires: EXPIRATION_DATE
    }, (err, redeem) => {
      if (err) {
        pendingJobs -= 1
        console.error(err, 'Error generating redeem code')
        return
      }

      pendingJobs -= 1
      console.log('+', 'REDEEM', redeem.id, redeem.achievement, new Date(redeem.expires).toDateString())
    })
  }

  waitForJobs()
}

function waitForJobs() {
  if (pendingJobs > 0) {
    console.log(`(${pendingJobs}) waiting...`)
    setTimeout(waitForJobs, 1500)
  } else {
    console.log('Done!')
    process.exit(0)
  }
}

createAchievement()
