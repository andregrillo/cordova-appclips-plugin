const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        console.log('Starting to build the CDVAppClips target...');
        
        const iosPlatformPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
        const sourcePath = path.join(context.opts.projectRoot, 'plugins', 'cordova.appclips.plugin', 'src/ios', 'exportOptionsAppClip.plist');
        const destinationPath = path.join(iosPlatformPath, 'exportOptionsAppClip.plist'); // Different filename

        // Step 0: Copy the correct exportOptions.plist for App Clips
        console.log(`Copying exportOptions.plist for App Clips from ${sourcePath} to ${destinationPath}...`);
        fs.copyFile(sourcePath, destinationPath, (copyError) => {
            if (copyError) {
                console.error(`Error copying exportOptions.plist for App Clips: ${copyError}`);
                reject(copyError);
                return;
            }
            console.log('Successfully copied exportOptions.plist for App Clips.');

            // Step 1: Archive the build
            const archiveCommand = `xcodebuild archive -workspace AppInstantClips.xcworkspace -scheme CDVAppClips -configuration Debug -sdk iphoneos -archivePath ${iosPlatformPath}/build/AppClips.xcarchive`;

            exec(archiveCommand, { cwd: iosPlatformPath }, (archiveError, archiveStdout, archiveStderr) => {
                if (archiveError) {
                    console.error(`Error archiving CDVAppClips: ${archiveError}`);
                    reject(archiveError);
                    return;
                }
                console.log('Successfully archived CDVAppClips.');
                console.log(archiveStdout);

                // Step 2: Export the archive to an IPA
                const exportCommand = `xcodebuild -exportArchive -archivePath ${iosPlatformPath}/build/AppClips.xcarchive -exportPath ${iosPlatformPath}/build/Debug-iphoneos -exportOptionsPlist ${destinationPath}`;

                exec(exportCommand, { cwd: iosPlatformPath }, (exportError, exportStdout, exportStderr) => {
                    if (exportError) {
                        console.error(`Error exporting CDVAppClips IPA: ${exportError}`);
                        reject(exportError);
                        return;
                    }
                    console.log('Successfully exported CDVAppClips IPA.');
                    console.log(exportStdout);

                    // Optional: List the contents of the directory where the IPA is expected to be
                    const ipaDirectoryPath = path.join(iosPlatformPath, 'build/Debug-iphoneos');
                    console.log(`Listing contents of the IPA directory: ${ipaDirectoryPath}`);
                    exec(`ls -l ${ipaDirectoryPath}`, (lsError, lsStdout, lsStderr) => {
                        if (lsError) {
                            console.error(`Error listing IPA directory: ${lsError}`);
                            reject(lsError);
                            return;
                        }
                        console.log(lsStdout);
                        resolve();
                    });
                });
            });
        });
    });
};
