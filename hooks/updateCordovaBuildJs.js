var fs = require('fs');
var path = require('path');
var {getCordovaParameter, log} = require('./utils');
var decode = require('decode-html');

console.log("Running hook to install NodeJS requirements");

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

    // Install the desired package directly within your hook
    var child_process = require('child_process');
    var deferral = context.requireCordovaModule('q').defer(); // Use 'q' module from Cordova context

    var packageName = 'cordova-plugin-ionic/preferences'; // Replace with the name of the package you want to install

    var output = child_process.exec('npm install ' + packageName, { cwd: __dirname }, function (error) {
        if (error !== null) {
            console.log('exec error: ' + error);
            deferral.reject('npm installation failed');
        } else {
            // Now that the package is installed, you can use it in your Cordova JS hook
            try {
                const preferences = require(packageName);

                // Use 'preferences' as needed in your Cordova JS hook
                var ppDecoded = preferences.get('PROVISIONING_PROFILES');
                var ppObject = JSON.parse(ppDecoded.replace(/'/g, "\""));
                var ppString = "";

                // Iterate to add multiple provisioning profiles
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
                
                deferral.resolve();
            } catch (err) {
                console.log('Error requiring ' + packageName + ':', err);
                deferral.reject('Error requiring ' + packageName);
            }
        }
    });

    return deferral.promise;
}
