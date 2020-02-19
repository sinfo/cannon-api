/* 
    The youtube API restricts the amount of HTTP requests 
    we are able to do, per day. Therefore, this 
    implementation respects the API limits and allows us 
    to periodically check if SINFO is livestreaming.
*/


const google = require('../../helpers/google')
const render = require('../../views/google')

// Time between calls
const timeOut = 5 * (60 * 1000);

// The stream information
var liveInfo = {
    up: false,
    url: ""
};

exports = module.exports;

exports.getLivestream = {
    tags: ['api', 'google'],
    handler: function (req, reply) {
        reply(liveInfo);
    }
}

if (process.env.NODE_ENV === "production")
    lastTimer = setTimeout(checkLiveStream, timeOut);

function checkLiveStream() {
    const now = new Date()

    if (now.getHours() >= 14 && now.getHours() <= 19) {
        google.getLiveStream((result, err) => {
            if (err) return;
            liveInfo = result;
        });
    }

    lastTimer = setTimeout(checkLiveStream, timeOut);
}