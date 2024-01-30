var fs = require('fs');
var path = require('path');
var { getCordovaParameter, log } = require('./utils');
var decode = require('decode-html');
var xml2js = require('xml2js');

function getProjectName() {
    var config = fs.readFileSync('config.xml').toString();
    var parseString = require('xml2js').parseString;
    var name;
    parseString(config, function (err, result) {
        name = result.widget.name.toString();
        const r = /\B\s+|\s+\B/g; // Removes trailing and leading spaces
        name = name.replace(r, '');
    });
    return name || null;
}

function readProvisioningProfiles(projectRoot) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(projectRoot, 'provisioning-profiles.txt');
        console.log("💡 filePath: " + filePath);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('🚨 Error reading provisioning-profiles.txt:', err);
                reject(err);
            } else {
                console.log('✅ provisioning-profiles.txt file read successfully.');
                resolve(data);
            }
        });
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

module.exports = function(context) {
    log('🦄 Running updateCordovaBuildJS hook, adding provisioning profiles to build.js 🦄 ', 'start');

    var iosFolder = context.opts.cordova.project
        ? context.opts.cordova.project.root
        : path.join(context.opts.projectRoot, 'platforms/ios/');
    var buildJsPath = path.join(iosFolder, 'cordova/lib', 'build.js');

    console.log("👉 1");
    readProvisioningProfiles(context.opts.projectRoot)
        .then(ppDecoded => {
            console.log("👉 2");
            console.log("💡 ppDecoded: " + ppDecoded);
            var ppObject = JSON.parse(ppDecoded.replace(/'/g, "\""));
            console.log("💡 ppObject: " + JSON.stringify(ppObject));
            var ppString = "";
            console.log("👉 3");

            Object.keys(ppObject).forEach(function (key) {
                console.log("👉 4");
                ppString += ", \n [ '" + key + "' ]: String('" + ppObject[key] + "')";
                log('Trying to add provisioning profile with uuid "' + ppObject[key] + '" to bundleId "' + key + '"', 'success');
            });

            var toReplace = "[ bundleIdentifier ]: String(buildOpts.provisioningProfile)";
            var regexp = new RegExp(escapeRegExp(toReplace), 'g');
            var plistContents = fs.readFileSync(buildJsPath, 'utf8');
            plistContents = plistContents.replace(regexp, toReplace + ppString);
            console.log("👉 5");
            fs.writeFileSync(buildJsPath, plistContents);
            console.log("👉 6");

            log('Successfully edited build.js', 'success');
        })
        .catch(error => {
            console.error('Error reading provisioning-profiles.txt:', error);
            
        });
};
