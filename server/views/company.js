module.exports = function render (content) {
  if (content instanceof Array) {
    return content.map(renderObject)
  }

  return renderObject(content)
}

function renderObject (model) {
  const adv = model.advertisementLvl
  // Determine partner flag from different shapes returned by transformCompany
  const partner = (function () {
    if (!adv) return false
    if (typeof adv === 'string') return adv === 'other'
    if (typeof adv === 'object') return adv.kind === 'Partner' || adv.advertisementLvl === 'other'
    return false
  })()

  return {
      id: model.id,
      name: model.name,
      site: model.site,
      advertisementLvl: model.advertisementLvl,
      partner: partner,
      img: model.img,
      sessions: model.sessions,
      standDetails: model.standDetails,
      stands: model.stands,
      members: model.members
  }
}

