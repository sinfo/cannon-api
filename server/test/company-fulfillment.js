const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const companyFulfillment = require('../resources/company-fulfillment')

const lab = exports.lab = Lab.script()

lab.experiment('Company fulfillment', () => {
  lab.test('adds default values only for latest announced participation', async () => {
    const participations = [
      { event: 24, status: 'CLOSED', stands: [{ standId: '1' }] },
      { event: 33, status: 'ANNOUNCED', stands: [{ standId: '5' }] },
      { event: 32, status: 'ANNOUNCED', stands: [{ standId: '3' }] }
    ]

    const latest = companyFulfillment.getLatestParticipation(participations)
    const filled = companyFulfillment.addFulfillmentDefaults(latest)

    Code.expect(filled.event).to.equal(33)
    Code.expect(filled.check_in).to.equal(false)
    Code.expect(filled.kit).to.equal(false)
    Code.expect(filled.stands[0].lunch_ticket).to.equal(false)

    Code.expect(participations[0].check_in).to.not.exist()
    Code.expect(participations[2].stands[0].lunch_ticket).to.not.exist()
    Code.expect(participations[1].check_in).to.not.exist()
  })

  lab.test('does not add defaults when latest participation is not announced', async () => {
    const participations = [
      { event: 24, status: 'ANNOUNCED', stands: [{ standId: '1' }] },
      { event: 33, status: 'CONFIRMED', stands: [{ standId: '5' }] }
    ]

    const latest = companyFulfillment.getLatestParticipation(participations)
    const filled = companyFulfillment.addFulfillmentDefaults(latest)

    Code.expect(filled.check_in).to.not.exist()
    Code.expect(filled.kit).to.not.exist()
    Code.expect(filled.stands[0].lunch_ticket).to.not.exist()
  })

  lab.test('selects latest participation even when some events are missing', async () => {
    const participations = [
      { status: 'ANNOUNCED' },
      { event: 33, status: 'ANNOUNCED' },
      { event: 24, status: 'ANNOUNCED' }
    ]

    const latest = companyFulfillment.getLatestParticipation(participations)

    Code.expect(latest.event).to.equal(33)
  })
})
