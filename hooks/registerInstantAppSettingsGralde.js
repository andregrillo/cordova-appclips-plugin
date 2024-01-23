var fs = require('fs-extra');
var path = require('path');

module.exports = function(context) {
    // Edit settings.gradle to set the Instant App module into cordova application
    var settingsGradlePath = path.join(context.opts.projectRoot, 'platforms/android/settings.gradle');
    var settingsContent = fs.readFileSync(settingsGradlePath, 'utf8');
    if (!settingsContent.includes('include ":instant-app"')) {
        fs.appendFileSync(settingsGradlePath, '\ninclude ":instant-app"\n');
        console.log('>>> ✅ >>>> Updated settings.gradle to include :instant-app');
    } else {
        console.log('>>> ❌ >>>> NO UPDATED settings.gradle to include :instant-app');
    }
};