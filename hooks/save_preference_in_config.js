var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');

module.exports = function(context) {
    var provisioningProfiles = context.opts.plugin.variables.PROVISIONING_PROFILES;

    if (!provisioningProfiles) {
        console.error('PROVISIONING_PROFILES variable not provided');
        return;
    }

    var configXmlPath = path.join(context.opts.projectRoot, 'config.xml');

    fs.readFile(configXmlPath, 'utf8', function(err, xml) {
        if (err) {
            throw new Error('Failed to read config.xml: ' + err);
        }

        var parser = new xml2js.Parser();
        parser.parseString(xml, function(err, result) {
            if (err) {
                throw new Error('Failed to parse config.xml: ' + err);
            }

            if (!result.widget.preference) {
                result.widget.preference = [];
            }

            // Add the PROVISIONING_PROFILES preference
            result.widget.preference.push({
                '$': {
                    name: 'PROVISIONING_PROFILES',
                    value: provisioningProfiles
                }
            });

            var builder = new xml2js.Builder();
            var newXml = builder.buildObject(result);

            fs.writeFile(configXmlPath, newXml, function(err) {
                if (err) {
                    throw new Error('Failed to write to config.xml: ' + err);
                }
                console.log('config.xml updated with PROVISIONING_PROFILES value.');
            });
        });
    });
};
