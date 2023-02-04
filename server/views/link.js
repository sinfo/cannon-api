module.exports =
  function render (content) {
    if (content instanceof Array) {
      return content.map(renderObject)
    }

    return renderObject(content)
  }

function renderObject (model) {
  return {
    author: model.author,
    company: model.company,
    edition: model.edition,
    user: model.user,
    attendee: model.attendee,
    notes: model.notes !== undefined && model.notes !== null ? {
      contacts: model.notes.contacts !== undefined ? {
        email: model.notes.contacts.email,
        phone: model.notes.contacts.phone
      } : { email: '', phone: '' },
      interestedIn: model.notes.interestedIn? model.notes.interestedIn: '',
      degree: model.notes.degree? model.notes.degree : '',
      availability: model.notes.availability? model.notes.availability : '',
      otherObservations: model.notes.otherObservations? model.notes.otherObservations: ''
    } : {
      contacts: {
        email: '',
        phone: ''
      },
      interestedIn: '',
      degree: '',
      availability: '',
      otherObservations: ''
    },
    created: model.created,
    updated: model.updated,
    cv: model.cv
  }
}
