var google = require('server/helpers/google');

module.exports = function render(content, user) {
  if(content instanceof Array) {
    return content.map(function(model) { return renderObject(model, user); });
  }

  return renderObject(content, user);
};

function renderObject(model, user) {
  var result = {};
  var isAllowed = user && (user.role === 'admin' || model.id === user.id);

  result.id = model.id;
  result.name = model.name;
  result.img = model.img || model.facebook && model.facebook.id && ('//graph.facebook.com/'+model.facebook.id+'/picture?width=400&height=400') || model.google && model.google.id && model.google.img;
  result.role = model.role,
  result.points = model.points && {
    available: model.points && model.points.available,
    total: model.points && model.points.total
  };
  result.achievements = model.achievements && model.achievements.map(function(achievement) {
    return {
      id: achievement && achievement.id,
      date: achievement && achievement.date
    };
  });
  result.area = model.area;
  result.skills = model.skills;
  result.registered = model.registered;

  if(isAllowed){
    result.mail = model.mail;
    result.facebook = model.facebook && {
      id: model.facebook && model.facebook.id
    };
    result.google = model.google && {
      id: model.google && model.google.id
    };
    result.fenix = model.fenix && {
      id: model.fenix && model.fenix.id,
      created: model.fenix && model.fenix.created
    };
    result.job = model.job && {
      startup: model.job && model.job.startup,
      internship: model.job && model.job.internship,
      start: model.job && model.job.start
    };
    result.updated = model.updated;
  }

  return result;
}