module.exports = function parseBody(body, cb) {
  if(typeof(body) != 'string') {
    if(body && (body.statusCode || body.code)) { return cb(body); }

    return cb(null, body);
  }

  if(body.replace(' ','') === '') {
    return cb(null, body);
  }

  var parsedBody;
  try {
    parsedBody = JSON.parse(body);
    if(parsedBody.statusCode || parsedBody.code) { return cb(parsedBody); }
  }
  catch (exc) {
    //if you don't know for sure that you are getting jsonp, then i'd do something like this
    try {
      var startPos = body.indexOf('({');
      var endPos = body.indexOf('})');
      var jsonString = body.substring(startPos+1, endPos+1);
      parsedBody = JSON.parse(jsonString);
    }
    catch(e) {
      return cb({exception: e, body: body}, body);
    }
    return cb(null, parsedBody);
  }
  return cb(null, parsedBody);
};