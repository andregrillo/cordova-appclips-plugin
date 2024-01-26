var fs = require('fs');
var path = require('path');

module.exports = function(context) {
    var provisioningProfiles = context.opts.plugin.variables.PROVISIONING_PROFILES;

    if (!provisioningProfiles) {
        console.error('PROVISIONING_PROFILES variable not provided');
        return;
    }

    var configXmlPath = path.join(context.opts.projectRoot, 'config.xml');

    fs.readFile(configXmlPath, 'utf8', function(err, data) {
        if (err) {
            throw new Error('Failed to read config.xml: ' + err);
        }

        // Replace the placeholder with the actual value
        var updatedData = data.replace('--PLACEHOLDER--', provisioningProfiles);

        fs.writeFile(configXmlPath, updatedData, 'utf8', function(err) {
            if (err) {
                throw new Error('Failed to write to config.xml: ' + err);
            }
            console.log('config.xml updated with PROVISIONING_PROFILES value.');
        });
    });
};
