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

async function getSessions(edition, withoutAchievements) {
  const sessions = await axios.get(`${DECK_API_URL}/sessions?sort=date&event=${edition}`)
  if (withoutAchievements) {
    filteredSessions = [];
    for(const session of sessions.data) {
      var achievement = await server.methods.achievement.getAchievementBySession(session.id)
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
  const speaker = await axios.get(`${DECK_API_URL}/public/speakers/${speakerId}`)
  return transformSpeaker(speaker.data)
}


// Translate Deck's event object to old format
function transformEvent(event, options) {
  return {
    id: event.id,
    name: event.name,
    kind: options?.kind || "Main Event",
    public: options?.public || true,
    date: event.begin,
    duration: new Date(new Date(event.end) - new Date(event.begin)),
    calendarUrl: event.calendarUrl,
  }
}

// Translate Deck's company object to old format
function transformCompany(company, options) {
  const advertisementLevels = {
    "Diamond": "exclusive",
    "Platinum": "max",
    "Gold": "med",
    "Gold NPE": "med",
    "Silver": "min",
    "Silver NPE": "min",
  };
  const participation = company.participation?.length > 0 && company.participation[0]; // Get the latest participation
  const advertisementLvl = advertisementLevels[participation?.package.name] || (participation?.partner && "other") || "none";

  return {
    id: company.id,
    name: company.name,
    img: company.img,
    description: company.description,
    advertisementLvl: options?.compact ? advertisementLvl : {
      advertisementLvl,
      kind: participation?.package.name || (participation?.partner && "Partner"),
      items: participation?.package.items,
    }
  }
}

// Translate Deck's member object to old format
function transformMember(member) {
  return {
    name: member.name,
    img: member.img,
  }
}

// Translate Deck's session object to old format
function transformSession(session, options) {
  const sessionKinds = {
    "TALK": "Keynote",
    "WORKSHOP": "Workshop",
    "PRESENTATION": "Presentation"
  }

  return {
    id: session.id,
    name: session.title,
    description: session.description,
    kind: sessionKinds[session.kind] || session.kind,
    event: options?.event || (session.company?.participation?.length > 0 && session.company.participation[0].event),
    date: session.begin,
    duration: new Date(new Date(session.end) - new Date(session.begin)),
    place: session.place,
    img: session.img || session.company?.img || (session.speaker.length > 0 && session.speaker[0].imgs.speaker),
    companies: session.company && [ session.company?.id ] || [],
    speakers: session.speaker && session.speaker.map(speaker => ({ id: speaker.id })) || [],
    tickets: session.tickets && {
      needed: !!session.tickets,
      start: session.tickets?.start,
      end: session.tickets?.end,
      max: session.tickets?.max,
    } || {},
  }
}

// Translate Deck's speaker object to old format
function transformSpeaker(speaker) {
  return {
    id: speaker.id,
    description: speaker.bio,
    name: speaker.name,
    title: speaker.title,
    img: speaker.imgs.speaker,
    feedback: speaker.participation[0].feedback
  }
}
