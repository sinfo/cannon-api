const axios = require('axios').default
const path = require('path')
const config = require(path.join(__dirname, '..', 'config'))

const DECK_API_URL = `${config.deck.url}/api`
let LATEST_EVENT

async function getLatestEdition() {
  if (LATEST_EVENT) {
    return LATEST_EVENT
  }
  
  const events = await axios.get(`${DECK_API_URL}/events`, { responseType: 'json' })

  let latestEvent = events.length > 0 ? events[0] : null
  let latestEventDate = events.length > 0 ? new Date(events[0].date).getTime() : null

  events.forEach(event => {
      const thisDate = new Date(event.date).getTime()
      if (thisDate > latestEventDate) {
          latestEvent = event
          latestEventDate = thisDate
      }
  })

  LATEST_EVENT = latestEvent
  return latestEvent
}

async function getCompanies(edition) {
  const companies = await axios.get(`${DECK_API_URL}/companies?event=${edition}`, { json: true })

  return companies.map(company => {
    return {
      id: company.id,
      name: company.name,
      advertisementLvl: company.advertisementLvl,
      img: company.img
    }
  })
}

async function getCompany(companyId) {
  return axios.get(`${DECK_API_URL}/companies/${companyId}`, { json: true })
}

async function getMember(memberId) {
  const member = await axios.get(`${DECK_API_URL}/members/${memberId}`, { json: true })

  return {
    id: member.id,
    name: member.name,
    img: member.img,
    github: member.github,
    facebook: member.facebook,
    mail: member.mail,
    twitter: member.twitter
  }
}

module.exports.getLatestEdition = getLatestEdition
module.exports.getCompanies = getCompanies
module.exports.getCompany = getCompany
module.exports.getMember = getMember