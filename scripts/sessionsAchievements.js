const server = require('../server').hapi
const API = server.methods
const log = require('../server/helpers/logger')
const request = require('request')

const DECK = 'http://localhost:8080'
const EVENT = '26-sinfo'

const CORLIEF = 'https://api.corlief.sinfo.org/reservation/latest'
const DECK_EVENT_URL = DECK + '/api/events'
const DECK_USER = 'francisco.pereira'
const DECK_TOKEN = 'XMO7vIyMdp0Xffd1eh5ZjoLEdX9vVZ09MRyDcgkZXSaxUJPXzB9lKAiRRqpW4fyYHdV2yXPMzOFr29MQtmAZjVXHFeyqsFOfZfoK'

let EVENT_START

// fill the true values of validity, or just make them all valid now
const trueValidity = true

const cvTo = new Date(2019, 2, 31, 23, 59, 59, 999)

// points distribution (%)
const points = {
  workshops: 0.4,
  presentations: 0.3,
  stands: 0.2,
  keynote: 0.1
}

const totalPoints = 1000.0

const achievements = {
  '1': {
    stands: [],
    presentations: [],
    workshops: [],
    keynote: []
  },

  '2': {
    stands: [],
    presentations: [],
    workshops: [],
    keynote: []
  },

  '3': {
    stands: [],
    presentations: [],
    workshops: [],
    keynote: []
  },

  '4': {
    stands: [],
    presentations: [],
    workshops: [],
    keynote: []
  },

  '5': {
    stands: [],
    presentations: [],
    workshops: [],
    keynote: []
  }
}

const otherAchievements = []
let pendingJobs = 0

function getEvent (listOfFunctions) {
  request({
    url: DECK_EVENT_URL,
    headers: { 'Authorization': `${DECK_USER} ${DECK_TOKEN}` }
  }, (err, _, body) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    let events = JSON.parse(body)

    let found = false
    for (let event of events) {
      if (event.id === EVENT) {
        EVENT_START = new Date(event.date)
        found = true
        break
      }
    }

    if (!found) {
      console.error(`ERROR: event ${EVENT} not found in Deck`)
      process.exit(1)
    }

    const next = listOfFunctions.pop()
    next(listOfFunctions)
  })
}

function stands (listOfFunctions) {
  request({
    url: CORLIEF,
    headers: { 'Authorization': `${DECK_USER} ${DECK_TOKEN}` }
  }, (err, _, body) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    const reservations = JSON.parse(body)

    reservations.forEach(r => {
      const companyId = r.companyId

      if (r.feedback === undefined || r.feedback.status !== 'CONFIRMED') return

      for (let stand of r.stands) {
        const day = stand.day
        const from = new Date(EVENT_START.getTime() + (1000 * 60 * 60 * 24) * (day - 1)) // shift the day
        const to = new Date(from)

        to.setHours(23)
        to.setMinutes(59)
        to.setSeconds(59)
        to.setMilliseconds(999)

        const img = `https://sinfo.ams3.cdn.digitaloceanspaces.com/static/${EVENT}/achievements/stands/stands_${companyId}_${day}.png`

        achievements[day].stands.push({
          name: `Talked to this company`,
          id: 'stand-' + companyId + '-' + day,
          img: img,
          value: 0,
          kind: 'stand',
          validity: {
            from: from,
            to: to
          }
        })
      }
    })

    const next = listOfFunctions.pop()
    next(listOfFunctions)
  })
}

function sessions (listOfFunctions) {
  API.session.list({ event: EVENT }, (err, sessions) => {
    if (err) {
      return
    }
    sessions.forEach(session => {
      let kind = ''
      let sessionKind = ''
      let sessionDay = 0
      const sessionDate = new Date(session.date)

      let found = false
      for (let day = 1; day <= 5; day++) {
        const eventDay = new Date(EVENT_START.getTime() + (1000 * 60 * 60 * 24) * (day - 1))

        if (eventDay.getDate() === sessionDate.getDate()) {
          sessionDay = day
          found = true
          break
        }
      }

      if (!found) {
        log.error({ sessionId: session.id }, 'could not calculate day of the week for this session')
        return
      }

      const from = new Date(EVENT_START.getTime() + (1000 * 60 * 60 * 24) * (sessionDay - 1)) // shift the day
      const to = new Date(from)

      to.setHours(23)
      to.setMinutes(59)
      to.setSeconds(59)
      to.setMilliseconds(999)

      let achievement = {
        name: `Went to "${session.name}"`,
        id: 'session-' + session.id,
        session: session.id,
        kind: '',
        value: 0
      }

      achievement['validity'] = !trueValidity ? {
        from: new Date(),
        to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7) // 1 week
      } : {
        from: from,
        to: to
      }

      switch (session.kind) {
        case 'Keynote':
          kind = 'keynote'
          sessionKind = 'keynote'
          break
        case 'Workshop':
          kind = 'workshops'
          sessionKind = 'workshop'
          break
        case 'Presentation':
          kind = 'presentations'
          sessionKind = 'presentation'
          break
      }

      achievement['kind'] = sessionKind
      achievement['img'] = `https://sinfo.ams3.cdn.digitaloceanspaces.com/static/${EVENT}/achievements/${kind.toLowerCase()}/${session.id}.png`
      achievements[sessionDay][kind].push(achievement)
    })

    const next = listOfFunctions.pop()
    next(listOfFunctions)
  })
}

function cv (listOfFunctions) {
  otherAchievements.push({
    name: `Submitted CV`,
    id: 'submitted-cv-' + EVENT,
    value: 0,
    kind: 'cv',
    img: `https://sinfo.ams3.cdn.digitaloceanspaces.com/static/${EVENT}/achievements/cv/cv.png`,
    validity: {
      from: EVENT_START,
      to: cvTo
    }
  })

  const next = listOfFunctions.pop()
  next(listOfFunctions)
}

function addAchievements (listOfFunctions) {
  let totalStands = 0
  let totalPresentations = 0
  let totalWorkshops = 0
  let totalKeynotes = 0

  Object.keys(achievements).forEach(day => {
    const nStands = achievements[day].stands.length
    const nPresentations = achievements[day].presentations.length
    const nWorkshops = achievements[day].workshops.length
    const nKeynotes = achievements[day].keynote.length

    totalStands += nStands
    totalPresentations += nPresentations
    totalWorkshops += nWorkshops
    totalKeynotes += nKeynotes

    const calculatedPoints = {
      stands: nStands > 0 ? Math.floor((points.stands * totalPoints) / nStands) : 0,
      presentations: nPresentations > 0 ? Math.floor((points.presentations * totalPoints) / nPresentations) : 0,
      workshops: nWorkshops > 0 ? Math.floor((points.workshops * totalPoints) / nWorkshops) : 0,
      keynote: nKeynotes > 0 ? Math.floor((points.keynote * totalPoints) / nKeynotes) : 0
    }

    const totalPointsThisDay = calculatedPoints.stands * nStands +
    calculatedPoints.presentations * nPresentations +
    calculatedPoints.workshops * nWorkshops +
    calculatedPoints.keynote * nKeynotes

    console.log(`
      ====== day ${day} ======
      # stands        ${nStands} (${calculatedPoints.stands})
      # presentations ${nPresentations} (${calculatedPoints.presentations})
      # workshops     ${nWorkshops} (${calculatedPoints.workshops})
      # keynotes      ${nKeynotes} (${calculatedPoints.keynote})
      Total points this day : ${totalPointsThisDay}
    `)

    Object.keys(achievements[day]).forEach(kind => {
      achievements[day][kind].forEach((achievement) => {
        achievement.value += calculatedPoints[kind]
        addAchievement(achievement, day, kind)
      })
    })
  })

  console.log(`
    ===== Total =====
    + ${totalStands} stands achievements
    + ${totalPresentations} presentations achievements
    + ${totalWorkshops} workshops achievements
    + ${totalKeynotes} keynotes achievements
  `)

  otherAchievements.forEach((achievement) => addAchievement(achievement))

  const next = listOfFunctions.pop()
  next(listOfFunctions)
}

function waitForJobs () {
  if (pendingJobs > 0) {
    console.log(`(${pendingJobs}) waiting...`)
    setTimeout(waitForJobs, 1500)
  } else {
    console.log('Done!')
    process.exit(0)
  }
}

function addAchievement (achievement, day, kind) {
  pendingJobs += 1
  API.achievement.create(achievement, (err, result) => {
    if (err && err.output.statusCode === 409) {
      console.log(' ', day || '', kind || '', achievement.id)
      pendingJobs -= 1
      return
    }

    if (err) {
      pendingJobs -= 1
      return log.warn({err: err, achievement: result}, 'achievement')
    }

    console.log('+', day || '', kind || '', result.id, result.value)
    pendingJobs -= 1
  })
}

getEvent([waitForJobs, addAchievements, sessions, cv, stands])
