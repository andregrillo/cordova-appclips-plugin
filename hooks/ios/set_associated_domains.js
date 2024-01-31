const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        const rootDir = context.opts.projectRoot; 
        const plistPath = path.join(rootDir, 'plugins/cordova.appclips.plugin/src/ios/CDVAppClips/CDVAppClips-Info.plist');
        const args = process.argv;
        var associatedDomains;
        
        for (const arg of args) {  
            if (arg.includes('ASSOCIATED_DOMAIN')){
                var stringArray = arg.split("=");
                associatedDomains = stringArray.slice(-1).pop();
            }
        }

        if (!associatedDomains) {
            reject('🚨 Missing associatedDomains information.');
            return;
        }

        // Read and update the plist file
        fs.readFile(plistPath, 'utf8', (err, data) => {
            if (err) {
                reject('🚨 Error reading plist file: ' + err);
                return;
            }

            // Replace the placeholder with the associatedDomains
            const modifiedData = data.replace('yourdomain.com', associatedDomains);

            // Write the modified content back to the file
            fs.writeFile(plistPath, modifiedData, 'utf8', (err) => {
                if (err) {
                    reject('🚨 Error writing to plist file: ' + err);
                } else {
                    resolve('✅ plist updated successfully.');
                }
            });
        });
    });
};
