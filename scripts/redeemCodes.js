var server = require('server').hapi;
var API = server.methods;
var log = require('server/helpers/logger');
var async = require('async');
var NodePDF = require('nodepdf');
var config = require('config');

var options = {
  'paperSize': {
    'pageFormat': 'A4',
    'margin': {
      'top': '2cm'
    },
    'header': {
      'height': '1cm',
      'contents': 'HEADER {currentPage} / {pages}' // If you have 2 pages the result looks like this: HEADER 1 / 2
    },
    'footer': {
      'height': '1cm',
      'contents': 'FOOTER {currentPage} / {pages}'
    }
  },
};

var authStr = config.auth.internal.username+':'+config.auth.internal.password+'@';

var cannonUrl = 'http://'+authStr+'localhost:8090';

function getUrl (id, quantity) {
  return cannonUrl+'/templates/achievements/'+id+'?quantity='+quantity;
}

function renderPDF(session, cb) {
  var quantity = 0;
  switch(session.kind.toLowerCase()) {
    case 'presentation':
      quantity = 70;
      break;
    case 'keynote':
      quantity = 350;
      break;
    case 'workshop':
      quantity = 40;
      break;
  }

  var achievementId = 'session-'+session.id;
  var url = getUrl(achievementId, quantity);

  var pdfName = __dirname+'/output/'+achievementId+'.pdf';

  log.debug({url: url, pdfName: pdfName}, 'render');

  NodePDF.render(url, pdfName, options, cb);
}


API.session.list(function (err, sessions) {
  log.debug({err: err, count: sessions.length}, 'got sessions');

  async.each(sessions, function (session, cb) {

    renderPDF(session, function (err, fileName) {
      if(err) {
        log.warn({err: err, fileName: fileName}, 'render');
      }



      cb();
    });
  }, function (err) {
    log.info({err: err}, 'redeem codes created');

    process.exit(0);
  });
});