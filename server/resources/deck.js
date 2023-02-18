const server = require('../').hapi
const axios = require('axios').default
const path = require('path')
const log = require('../helpers/logger')
const config = require(path.join(__dirname, '..', '..', 'config'))


server.method('deck.getLatestEdition', getLatestEdition, {})
server.method('deck.getCompanies', getCompanies, {})
server.method('deck.getCompany', getCompany, {})
server.method('deck.getMembers', getMembers, {})

const DECK_API_URL = `${config.deck.url}/api`
let LATEST_EVENT

async function getLatestEdition() {
  if (LATEST_EVENT) {
    return LATEST_EVENT
  }
  
  const events = await axios.get(`${DECK_API_URL}/events`, { responseType: 'json' })

  let latestEvent = events.data.length > 0 ? events.data[0] : null
  let latestEventDate = events.data.length > 0 ? new Date(events.data[0].date).getTime() : null

  events.data.forEach(event => {
      const thisDate = new Date(event.date).getTime()
      if (thisDate > latestEventDate) {
          latestEvent = event
          latestEventDate = thisDate
      }
  })

  LATEST_EVENT = latestEvent.id
  return LATEST_EVENT
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