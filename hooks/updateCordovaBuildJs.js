
var fs = require('fs');
var path = require('path');
var {getCordovaParameter, log} = require('./utils');
var decode = require('decode-html');
var xml2js = require('xml2js');

function readProvisioningProfilesPreference(projectRoot) {
    return new Promise((resolve, reject) => {
        var configXmlPath = path.join(projectRoot, 'config.xml');

        fs.readFile(configXmlPath, 'utf8', function(err, xml) {
            if (err) {
                return reject('Failed to read config.xml: ' + err);
            }

            var parser = new xml2js.Parser();
            parser.parseString(xml, function(err, result) {
                if (err) {
                    return reject('Failed to parse config.xml: ' + err);
                }

                var preferences = result.widget.preference;
                if (preferences) {
                    for (var i = 0; i < preferences.length; i++) {
                        if (preferences[i].$.name === 'PROVISIONING_PROFILES') {
                            return resolve(preferences[i].$.value);
                        }
                    }
                }

                return reject('PROVISIONING_PROFILES preference not found');
            });
        });
    });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

module.exports = function(context) {
    
    log(
    '🦄 Running updateCordovaBuildJS hook, adding provisioning profiles to build.js 🦄 ',
    'start'
    );

    var iosFolder = context.opts.cordova.project
    ? context.opts.cordova.project.root
    : path.join(context.opts.projectRoot, 'platforms/ios/');

    var buildJsPath = path.join(
        iosFolder,
        'cordova/lib',
        'build.js'
    )

    const ppDecoded = readProvisioningProfilesPreference(context.opts.projectRoot);

    var ppObject = JSON.parse(ppDecoded.replace(/'/g, "\""));
    var ppString = "";
    
    //we iterate here so we can add multiple provisioning profiles to, in the future, add provisioning profiles for other extensions
    Object.keys(ppObject).forEach(function (key) {
        ppString += ", \n [ '" + key + "' ]: String('" + ppObject[key] + "')";
        log('Trying to add provisioning profile with uuid "' + ppObject[key] + '" to bundleId "' + key + '"','success');
    });

    var toReplace = "[ bundleIdentifier ]: String(buildOpts.provisioningProfile)";
    var regexp = new RegExp(escapeRegExp(toReplace), 'g');
    var plistContents = fs.readFileSync(buildJsPath, 'utf8');
    plistContents = plistContents.replace(regexp, toReplace + ppString);
    fs.writeFileSync(buildJsPath, plistContents);

    log('Successfully edited build.js', 'success');
}
