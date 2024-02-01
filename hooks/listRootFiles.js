const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = function(context) {
    const projectRoot = context.opts.projectRoot;
    const iosPlatformPath = path.join(projectRoot, 'platforms', 'ios');

    // Function to execute a shell command
    function executeCommand(cmd, workingDirectory) {
        return new Promise((resolve, reject) => {
            exec(cmd, { cwd: workingDirectory }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(error);
                    return;
                }
                console.log(stdout);
                resolve(stdout);
            });
        });
    }

    // Function to list schemes and configurations
    async function listXcodeDetails() {
        const projectPath = fs.readdirSync(iosPlatformPath).find(file => file.endsWith('.xcodeproj'));
        const workspacePath = fs.readdirSync(iosPlatformPath).find(file => file.endsWith('.xcworkspace'));

        if (projectPath) {
            console.log('Listing schemes for project:');
            await executeCommand(`xcodebuild -project ${projectPath} -list`, iosPlatformPath);
        }

        if (workspacePath) {
            console.log('Listing schemes and configurations for workspace:');
            await executeCommand(`xcodebuild -workspace ${workspacePath} -list`, iosPlatformPath);
        }
    }

    // Call the function to list Xcode details
    listXcodeDetails().then(() => {
        console.log('Finished listing Xcode project details.');
    }).catch(error => {
        console.error('Error listing Xcode project details:', error);
    });
};