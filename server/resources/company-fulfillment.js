function getLatestParticipation (participations) {
  if (!Array.isArray(participations) || participations.length === 0) {
    return undefined
  }

  return participations.reduce((latest, current) => {
    if (!latest) return current
    return Number(current?.event) > Number(latest?.event) ? current : latest
  }, undefined)
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
