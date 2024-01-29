var fs = require('fs');
var path = require('path');

module.exports = function(context) {
    const args = process.argv

    var provisioningProfile;
    for (const arg of args) {  
      if (arg.includes('PROVISIONING_PROFILES')){
        var stringArray = arg.split("=");
        provisioningProfile = stringArray.slice(-1).pop();
      }
    }

    if (!provisioningProfile) {
        console.error('🚨 PROVISIONING_PROFILES input variable not provided');
        return;
    }

    var pluginXmlPath = path.join(context.opts.projectRoot, "plugins", "cordova.appclips.plugin", 'plugin.xml');

    fs.readFile(pluginXmlPath, 'utf8', function(err, data) {
        if (err) {
            throw new Error('🚨 Failed to read plugin.xml: ' + err);
        }

        // Replace the placeholder with the actual value
        var updatedData = data.replace('--PLACEHOLDER--', provisioningProfile);

        fs.writeFile(pluginXmlPath, updatedData, 'utf8', function(err) {
            if (err) {
                throw new Error('🚨 Failed to write to plugin.xml: ' + err);
            }
            console.log('✅ plugin.xml updated with PROVISIONING_PROFILES value.');
        });
    });
};
