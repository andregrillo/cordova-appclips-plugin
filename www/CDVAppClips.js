var exec = require('cordova/exec');

exports.setOptions = function (options, success, error) {
    exec(success, error, 'CDVAppClips', 'setOptions', [options]);
};
