module.exports = function render(content, user) {
  if(content instanceof Array) {
    return content.map(function(model) { return renderObject(model, user); });
  }

  return renderObject(content, user);
};

function renderObject(model, user) {
  var result = {};
  var isAllowed = user.role === 'admin' || model.id === user.id;

  result.id = model.id;
  result.name = model.name;
  result.img = model.img || model.facebook && model.facebook.id && ('//graph.facebook.com/'+model.facebook.id+'/picture?width=400&height=400');
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
  result.job = model.job && {
    startup: model.job && model.job.startup,
    internship: model.job && model.job.internship,
    start: model.job && model.job.start
  };
  result.registered = model.registered;

  if(isAllowed){
    result.mail = model.mail;
    result.bearer = model.bearer && model.bearer.map(function(bearerToken) {
      return {
        token: bearerToken && bearerToken.token,
        refreshToken: bearerToken && bearerToken.refreshToken,
        ttl: bearerToken && bearerToken.ttl,
        date: bearerToken && bearerToken.date
      };
    });
    result.facebook = model.facebook && {
      id: model.facebook && model.facebook.id,
      token: model.facebook && model.facebook.token
    };
    result.google = model.google && {
      id: model.google && model.google.id,
      token: model.google && model.google.token
    };
    result.fenix = model.fenix && {
      id: model.fenix && model.fenix.id,
      token: model.fenix && model.fenix.token,
      refreshToken: model.fenix && model.fenix.refreshToken,
      ttl: model.fenix && model.fenix.ttl,
      created: model.fenix && model.fenix.created
    };
    result.updated = model.updated;
  }

  return result;
}