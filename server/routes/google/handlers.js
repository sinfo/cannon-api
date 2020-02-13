/* 
    The youtube API restricts the amount of HTTP requests 
    we are able to do, per day. Therefore, this 
    implementation respects the API limits and allows us 
    to periodically check if SINFO is livestreaming.
*/


const google = require('../../helpers/google')
const googleConfig = require('../../config').google

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
    url: ""
};

var lastTimer = 0;

exports = module.exports;

exports.getLivestream = {
    tags: ['api', 'google'],
    handler: function (req, reply) {
        reply(liveInfo);
    }
}

if (googleConfig.apiKey)
    lastTimer = setTimeout(checkLiveStream, timeOut);

function checkLiveStream() {
    var currentDate = new Date();
    var hours = currentDate.getHours();

    if (hours < interval.min || hours > interval.max) {
        clearTimeout(lastTimer);
        setTimeout(checkLiveStream, (hours + 19) * 60 * 60 * 1000);
        liveInfo.up = false;
        liveInfo.url = "";
        return;
    }

    google.getLiveStream(result => {
        liveInfo = result;
    });

    lastTimer = setTimeout(checkLiveStream, timeOut);
}