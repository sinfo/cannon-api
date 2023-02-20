const server = require('../').hapi
const axios = require('axios').default
const path = require('path')
const log = require('../helpers/logger')
const config = require(path.join(__dirname, '..', '..', 'config'))


server.method('deck.getLatestEdition', getLatestEdition, {})
server.method('deck.getPreviousEdition', getPreviousEdition, {})
server.method('deck.getEvents', getEvents, {})
server.method('deck.getCompanies', getCompanies, {})
server.method('deck.getCompany', getCompany, {})
server.method('deck.getMembers', getMembers, {})
server.method('deck.getSessions', getSessions, {})
server.method('deck.getSession', getSession, {})
server.method('deck.getSpeakers', getSpeakers, {})
server.method('deck.getSpeaker', getSpeaker, {})

const DECK_API_URL = `${config.deck.url}/api`

async function getLatestEdition() {
  const event = await axios.get(`${DECK_API_URL}/events?sort=-date&limit=1`, { json: true })
  return event.data[0]
}

async function getEvents() {
  const events = await axios.get(`${DECK_API_URL}/events?sort=-date`, { json: true })
  return events.data
}

async function getPreviousEdition() {
  const event = await axios.get(`${DECK_API_URL}/events?sort=-date&limit=1&skip=1`, { json: true })
  return event.data[0]
}

async function getCompanies(edition) {
  const companies = await axios.get(`${DECK_API_URL}/companies?event=${edition}`, { json: true })
  

  return companies.data.map(company => {
    return {
      id: company.id,
      name: company.name,
      advertisementLvl: company.advertisementLvl,
      img: company.img
    }
  })
}

async function getCompany(companyId) {
  const company = await axios.get(`${DECK_API_URL}/companies/${companyId}`, { json: true })
  return company.data
}

async function getMembers(edition) {
  const members = await axios.get(`${DECK_API_URL}/members?sort=name&event=${edition}&participations=true`, { json: true })
  return members.data
}

async function getSessions(edition, withoutAchievements, request) {
  const sessions = await axios.get(`${DECK_API_URL}/sessions?sort=date&event=${edition}`)
  if (withoutAchievements) {
    filteredSessions = [];
    for(const session of sessions.data) {
      var achievement = await request.server.methods.achievement.getAchievementBySession(session.id)
      if (!achievement) {
        filteredSessions.push(session);
      }
    }
    return filteredSessions;
  } else {
    return sessions.data
  }
}

async function getSession(sessionId) {
  const session = await axios.get(`${DECK_API_URL}/sessions/${sessionId}`)
  return session.data
} 

async function getSpeakers(edition) {
  const speakers = await axios.get(`${DECK_API_URL}/speakers?sort=name&event=${edition}&participations=true`)
  return speakers.data
}

async function getSpeaker(speakerId) {
  const speaker = await axios.get(`${DECK_API_URL}/speakers/${speakerId}`)
  return speaker.data
} 