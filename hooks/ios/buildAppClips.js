const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const xcode = require('xcode')

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

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        console.log('Starting to build the CDVAppClips target...');

        const iosPlatformPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
        const sourcePath = path.join(context.opts.projectRoot, 'plugins', 'cordova.appclips.plugin', 'src/ios', 'exportOptionsAppClip.plist');
        const destinationPath = path.join(iosPlatformPath, 'exportOptionsAppClip.plist');

        // Step 0: Copy the correct exportOptions.plist for App Clips
        console.log(`Copying exportOptions.plist for App Clips from ${sourcePath} to ${destinationPath}...`);
        fs.copyFile(sourcePath, destinationPath, (copyError) => {
            if (copyError) {
                console.error(`Error copying exportOptions.plist for App Clips: ${copyError}`);
                reject(copyError);
                return;
            }
            console.log('Successfully copied exportOptions.plist for App Clips.');

            // Clean the build folder
            const cleanCommand = `xcodebuild clean -workspace AppInstantClips.xcworkspace -scheme CDVAppClips`;
            exec(cleanCommand, { cwd: iosPlatformPath }, (cleanError, cleanStdout, cleanStderr) => {
                if (cleanError) {
                    console.error(`Error cleaning CDVAppClips: ${cleanError}`);
                    reject(cleanError);
                    return;
                }
                console.log('Successfully cleaned CDVAppClips.');
                console.log(cleanStdout);

                var pbxPath = path.join(context.opts.projectRoot, 'platforms/ios/',getProjectName() + '.xcodeproj','project.pbxproj');

                let project = xcode.project(pbxPath);
                project.parseSync();

                Object.keys(project.pbxXCBuildConfigurationSection()).forEach((key) => {
                    var config = project.pbxXCBuildConfigurationSection()[key];
                    if (typeof config === 'object' && config.buildSettings) {
                        const productName = config.buildSettings['PRODUCT_NAME'];
                        console.log(`PRODUCT_NAME: ${productName}`);

                        // Skip if PRODUCT_NAME is undefined or doesn't directly match a string
                        if (productName && (productName === '"CDVAppClips"' || productName.includes('CDVAppClips'))) {
                            console.log('⭐️ Set SKIP_INSTALL to NO!');
                            config.buildSettings['SKIP_INSTALL'] = 'NO';
                        }
                    }
                });
                fs.writeFileSync(pbxPath, project.writeSync());

                // Step 1: Archive the build with verbose output
                
                const archiveCommand = `xcodebuild -scheme CDVAppClips -workspace AppInstantClips.xcworkspace clean archive -archivePath build/AppClips.xcarchive -verbose -sdk iphoneos`;
                //const archiveCommand = `xcodebuild archive -workspace AppInstantClips.xcworkspace -scheme CDVAppClips -configuration Debug -sdk iphoneos -archivePath build/Debug-iphoneos/AppClips.xcarchive -verbose`;
                //const archiveCommand = `xcodebuild -workspace AppInstantClips.xcworkspace -scheme CDVAppClips -configuration Debug -destination generic/platform=iOS -archivePath AppClips.xcarchive archive -verbose`;
                console.log('ℹ️ Will run the archiveCommand')                   
                exec(archiveCommand, { cwd: iosPlatformPath }, (archiveError, archiveStdout, archiveStderr) => {
                    console.log('⭐️⭐️⭐️ Running archiveCommand ⭐️⭐️⭐️')
                    if (archiveError) {
                        console.error(`🚨 Error archiving CDVAppClips: ${archiveError}`);
                        reject(archiveError);
                        return;
                    }
                    console.log('✅ Successfully archived CDVAppClips.');
                    console.log(archiveStdout);

                    // Step 2: Export the archive to an IPA

                    //const exportCommand = `xcodebuild -exportArchive -archivePath ${iosPlatformPath}/build/Debug-iphoneos/AppClips.xcarchive -exportPath ${iosPlatformPath}/build/Debug-iphoneos -exportOptionsPlist ${destinationPath}`;
                    const exportCommand = `xcodebuild -exportArchive -archivePath build/AppClips.xcarchive -exportPath build -exportOptionsPlist exportOptionsAppClip.plist`;

                    exec(exportCommand, { cwd: iosPlatformPath }, (exportError, exportStdout, exportStderr) => {
                        console.log('⭐️⭐️⭐️ Exporting IPA ⭐️⭐️⭐️')
                        if (exportError) {
                            console.error(`🚨 Error exporting CDVAppClips IPA: ${exportError}`);
                            reject(exportError);
                            return;
                        }
                        console.log('✅ Successfully exported CDVAppClips IPA.');
                        console.log(exportStdout);

                        // Optional: List the contents of the directory where the IPA is expected to be
                        const ipaDirectoryPath = path.join(iosPlatformPath, 'build');
                        console.log(`⭐️ Listing contents of the IPA directory: ${ipaDirectoryPath}`);
                        exec(`ls -l ${ipaDirectoryPath}`, (lsError, lsStdout, lsStderr) => {
                            if (lsError) {
                                console.error(`🚨 Error listing IPA directory: ${lsError}`);
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
    });
};
