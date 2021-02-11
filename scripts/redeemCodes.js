const server = require('../server').hapi
const API = server.methods

// ===================== edit here =====================

const REDEEM_CODES_NUMBER = 2
const EXPIRATION_DATE = new Date(2019, 2, 1)
const ACHIEVEMENT_VALUE = 20
const ACHIEVEMENT_NAME = 'Discovered a secret!'

// ===================== end of edit =====================

const ACHIEVEMENT_VALIDITY_FROM = new Date()
const ACHIEVEMENT_VALIDITY_TO = EXPIRATION_DATE
const ACHIEVEMENT_IMG = 'https://sinfo.ams3.cdn.digitaloceanspaces.com/static/26-sinfo/achievements/gamification.png'
const ACHIEVEMENT_KIND = 'other'

// let pendingJobs = 0

function randomString () {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < 2; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

function createAchievement () {
  let achievement = {
    name: ACHIEVEMENT_NAME,
    id: randomString(),
    kind: ACHIEVEMENT_KIND,
    value: ACHIEVEMENT_VALUE,
    img: ACHIEVEMENT_IMG,
    validity: {
      from: ACHIEVEMENT_VALIDITY_FROM,
      to: ACHIEVEMENT_VALIDITY_TO
    }
  }

  API.achievement.create(achievement, (err, result) => {
    if (err) {
      return console.error({ err: err }, 'error creating an achievement')
    }

    console.log('+', 'ACHIEVEMENT', result.id, result.value)

    createRedeemCodes(result)
  })
}

function createRedeemCodes (achievement) {
  API.redeem.create({
    id: randomString(),
    achievement: achievement.id,
    available: REDEEM_CODES_NUMBER
  }, (err, redeem) => {
    if (err) {
      console.error(err, 'Error generating redeem code')
      process.exit(1)
      return
    }

    console.log('+', 'REDEEM', redeem.id, redeem.achievement)
    console.log(JSON.stringify(redeem, null, 2))
    process.exit(0)
  })
}

// function waitForJobs() {
//   if (pendingJobs > 0) {
//     console.log(`(${pendingJobs}) waiting...`)
//     setTimeout(waitForJobs, 1500)
//   } else {
//     console.log('Done!')
//     process.exit(0)
//   }
// }

createAchievement()
