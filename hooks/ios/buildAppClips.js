// File: hooks/after_compile/buildAppClips.js

const { exec } = require('child_process');
const path = require('path');

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        console.log('Starting to build the CDVAppClips target...');

        const iosPlatformPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
        const buildCommand = `xcodebuild -workspace AppInstantClips.xcworkspace -scheme CDVAppClips -configuration Debug -sdk iphoneos build`;

        exec(buildCommand, { cwd: iosPlatformPath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error building CDVAppClips: ${error}`);
                reject(error);
                return;
            }
            console.log('CDVAppClips build stdout:\n', stdout);
            if(stderr) {
                console.log('CDVAppClips build stderr:\n', stderr);
            }
            console.log('Successfully built the CDVAppClips target.');

            // Adjusted path for the Debug-iphoneos directory
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
};
