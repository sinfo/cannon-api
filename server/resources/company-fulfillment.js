function getLatestParticipation (participations) {
  if (!Array.isArray(participations) || participations.length === 0) {
    return undefined
  }

  return participations.reduce((latest, current) => {
    if (!latest) return current
    const normalizedCurrentEvent = normalizeEventNumber(current?.event)
    const normalizedLatestEvent = normalizeEventNumber(latest?.event)

    return normalizedCurrentEvent > normalizedLatestEvent ? current : latest
  }, undefined)
}

function normalizeEventNumber (event) {
  const eventNumber = Number(event)
  return Number.isFinite(eventNumber) ? eventNumber : -Infinity
}

function addFulfillmentDefaults (participation) {
  if (!participation || participation.status !== 'ANNOUNCED') {
    return participation
  }

  return {
    ...participation,
    check_in: participation.check_in ?? false,
    kit: participation.kit ?? false,
    stands: Array.isArray(participation.stands)
      ? participation.stands.map(stand => ({
          ...stand,
          lunch_ticket: stand.lunch_ticket ?? false
        }))
      : participation.stands
  }
}

module.exports = {
  getLatestParticipation,
  addFulfillmentDefaults
}
