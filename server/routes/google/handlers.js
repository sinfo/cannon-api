const google = require('../../helpers/google')

// Time between calls
const timeOut = 5 * (60 * 1000);

// When the checkStream function should run
const interval = {
    min: 14,
    max: 19
};

// The stream information
var liveInfo = {
    up: false,
    id: ""
};

var lastTimer = 0;

exports = module.exports;

exports.getLivestream = {
    tags: ['api', 'google'],
    handler: function (req, reply) {
        reply(liveInfo);
    }
}

lastTimer = setTimeout(checkLiveStream, timeOut);

function checkLiveStream() {
    var currentDate = new Date();
    var hours = currentDate.getMinutes();

    if (hours < interval.min || hours > interval.max) {
        clearTimeout(lastTimer);
        setTimeout(checkLiveStream, (hours + 19) * 60 * 60 * 1000);
        liveInfo.up = false;
        liveInfo.id = "";
        return;
    }

    google.getLiveStream(result => {
        liveInfo = result;
    });

    lastTimer = setTimeout(checkLiveStream, timeOut);
}