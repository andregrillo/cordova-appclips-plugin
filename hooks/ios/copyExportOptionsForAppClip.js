const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        const iosPlatformPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
        const sourcePath = path.join(context.opts.projectRoot, 'plugins', 'cordova.appclips.plugin', 'src/ios' ,'exportOptionsAppClip.plist'); // Adjust this path to where the new plist is stored temporarily
        const destinationPath = path.join(iosPlatformPath, 'exportOptions.plist'); // This should overwrite the existing plist for the build process

        // Copy the file
        fs.copyFile(sourcePath, destinationPath, (err) => {
            if (err) {
                console.error('Error copying exportOptions.plist for App Clip:', err);
                reject(err);
            } else {
                console.log('Successfully copied exportOptions.plist for App Clip.');
                resolve();
            }
        });
    });
};
