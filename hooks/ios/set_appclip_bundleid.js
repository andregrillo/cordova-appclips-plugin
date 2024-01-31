const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        const rootDir = context.opts.projectRoot; 
        const plistPath = path.join(rootDir, 'plugins/cordova.appclips.plugin/src/ios/CDVAppClips/CDVAppClips-Info.plist');
        const entitlementsPath = path.join(rootDir, 'plugins/cordova.appclips.plugin/src/ios/CDVAppClips/CDVAppClips.entitlements');
        const contentViewPath = path.join(rootDir, 'plugins/cordova.appclips.plugin/src/ios/CDVAppClips/ContentView.swift');
        const args = process.argv;

        var mainAppId;
        var appClipAppId;
        var appClipURL;
        for (const arg of args) {  
            if (arg.includes('APPCLIP_APP_ID')){
                var stringArray = arg.split("=");
                appClipAppId = stringArray.slice(-1).pop();
            }
            else if (arg.includes('PRODUCT_BUNDLE_IDENTIFIER')){
                var stringArray = arg.split("=");
                mainAppId = stringArray.slice(-1).pop();
            }
            else if (arg.includes('APP_INSTANT_CLIPS_URL')){
                var stringArray = arg.split("=");
                appClipURL = stringArray.slice(-1).pop();
            }
        }

        if (!appClipAppId) {
            reject('🚨 APPCLIP_APP_ID not found.');
            return;
        }

        if (!mainAppId) {
            reject('🚨 PRODUCT_BUNDLE_IDENTIFIER not found.');
            return;
        }
        if (!appClipURL) {
            reject('🚨 APP_INSTANT_CLIPS_URL not found.');
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


        // Read the contents of the entitlements file
        fs.readFile(entitlementsPath, 'utf8', (err, data) => {
            if (err) {
                reject('✅ Error reading entitlements file: ' + err);
                return;
            }

            // Replace the placeholder with the mainAppId
            const modifiedData = data.replace('--PLACEHOLDER--', mainAppId);

            // Write the modified content back to the file
            fs.writeFile(entitlementsPath, modifiedData, 'utf8', (err) => {
                if (err) {
                    reject('🚨 Error writing to entitlements file: ' + err);
                    return;
                }

                resolve('✅ Plist file updated successfully.');
            });
        });

        // Read the contents of the contentview file
        fs.readFile(contentViewPath, 'utf8', (err, data) => {
            if (err) {
                reject('✅ Error reading contentview file: ' + err);
                return;
            }

            // Replace the placeholder with the appClipAppId
            const modifiedData = data.replace('--PLACEHOLDER--', appClipURL);

            // Write the modified content back to the file
            fs.writeFile(contentViewPath, modifiedData, 'utf8', (err) => {
                if (err) {
                    reject('🚨 Error writing to contentview file: ' + err);
                    return;
                }

                resolve('✅ Plist contentview updated successfully.');
            });
        });
    });
};
