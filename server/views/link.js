module.exports =
  function render (content) {
    if (content instanceof Array) {
      return content.map(renderObject)
    }

    return renderObject(content)
  }

function renderObject (model) {
  const result = {}
  let _contacts

  // Common to attendee and company views of links
  result.author = model.author
  result.company = model.company
  result.edition = model.edition
  result.user = model.user
  result.attendee = model.attendee
  result.created = model.created
  result.updated = model.updated

  if (model.author === "company") {  // Company link view
    result.cv = model.cv
    if (!model.notes) {
      _contacts = {
        email: '', 
        phone: ''
      }
      result.notes = {
        contacts : _contacts,
        interestedIn : '',
        degree: '',
        availability: '',
        otherObservations: ''
      }

      return result
    }

    if (model.notes.contacts){
      _contacts = {
        email: model.notes.contacts.email ?? '',
        phone: model.notes.contacts.phone ?? ''
      }
    }
    else {
      _contacts = {
        email: '', 
        phone: ''
      }
    }
    result.notes = {
      contacts : _contacts,
      interestedIn : model.notes.interestedIn ?? '',
      degree: model.notes.degree ?? '',
      availability: model.notes.availability ?? '',
      otherObservations: model.notes.otherObservations ?? ''
    }

    return result
  } 
  else { // Attendee link view
    if (!model.notes) {
      _contacts = {
        email: ''
      }
      result.notes = {
        contacts : _contacts,
        internships : '',
        otherObservations: ''
      }

      return result
    }

    if (model.notes.contacts){
      _contacts = {
        email: model.notes.contacts.email ?? ''
      }
    }
    else {
      _contacts = {
        email: ''
      }
    }

    result.notes = {
      contacts : _contacts,
      internships : model.notes.internships ?? '',
      otherObservations: model.notes.otherObservations ?? ''
    }
    
    return result
  }
}
