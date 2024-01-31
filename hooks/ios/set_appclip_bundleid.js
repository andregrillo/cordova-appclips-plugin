const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        const rootDir = context.opts.projectRoot; 
        const plistPath = path.join(rootDir, 'plugins/cordova.appclips.plugin/src/ios/CDVAppClips/CDVAppClips-Info.plist');
        const args = process.argv;

        var appClipAppId;
        for (const arg of args) {  
            if (arg.includes('APPCLIP_APP_ID')){
                var stringArray = arg.split("=");
                appClipAppId = stringArray.slice(-1).pop();
            }
        }

        if (!appClipAppId) {
            reject('🚨 APPCLIP_APP_ID not found.');
            return;
        }

        // Read the contents of the plist file
        fs.readFile(plistPath, 'utf8', (err, data) => {
            if (err) {
                reject('✅ Error reading plist file: ' + err);
                return;
            }

            // Replace the placeholder with the appClipAppId
            const modifiedData = data.replace('--PLACEHOLDER--', appClipAppId);

            // Write the modified content back to the file
            fs.writeFile(plistPath, modifiedData, 'utf8', (err) => {
                if (err) {
                    reject('🚨 Error writing to plist file: ' + err);
                    return;
                }

                resolve('✅ Plist file updated successfully.');
            });
        });
    });
};
