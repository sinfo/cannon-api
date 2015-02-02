module.exports = function render(content) {
  if(content instanceof Array) {
    return content.map(renderObject);
  }

  return renderObject(content);  
};

function renderObject(model) {
  return {
    id: model.id,
    name: model.name,
    bearer: model.bearer && model.bearer.map(function(bearerToken) {
      return {
        token: bearerToken && bearerToken.token,
        date: bearerToken && bearerToken.date
      };
    }),
    facebook: model.facebook && {
      id: model.facebook && model.facebook.id,
      token: model.facebook && model.facebook.token
    },
    google: model.google && {
      id: model.google && model.google.id,
      token: model.google && model.google.token
    },
    fenix: model.fenix && {
      id: model.fenix && model.fenix.id,
      token: model.fenix && model.fenix.token,
      refreshToken: model.fenix && model.fenix.refreshToken
    },
		role: model.role,
		mail: model.mail,
		points: model.points && {
      available: model.points && model.points.available,
      total: model.points && model.points.total
    },
		achievements: model.achievements && model.achievements.map(function(achievement) {
      return {
        id: achievement && achievement.id,
        date: achievement && achievement.date
      };
    }),
		files: model.files,
    registered: model.registered,
    updated: model.updated
  };
}