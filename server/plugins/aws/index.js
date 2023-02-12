const aws = require('./aws')
const path = require('path')
const config = require(path.join(__dirname, '..', '..', '..', 'config'))

function getAchievementPath(edition, companyId) {
    return companyId !== undefined
    ? `/static/${edition}/achievements/stands/${companyId}/`
    : `/static/${edition}/achievements/`
}

function uploadAchievement() {
  return (file, filename, edition, companyId) => {
    const path = getAchievementPath(edition, companyId)
    return aws.upload(path, file, filename, true)
  }
}

function downloadAchievement() {
  return (filename, edition, companyId) => {
    const path = getAchievementPath(edition, companyId)
    return aws.download(path, filename)
  }
}

function removeAchievement() {
  return (filename, edition, companyId) => {
    const path = getAchievementPath(edition, companyId)
    return aws.delete(path, filename)
  }
}

module.exports = {
  name: 'aws',
  version: '1.0.0',
  register: async (server, options) => {
    server.method('files.achievements.upload', uploadAchievement)
    server.method('files.achievements.download', downloadAchievement)
    server.method('files.achievements.remove', removeAchievement)
  }
}
