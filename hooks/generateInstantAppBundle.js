var fs = require('fs-extra');
var path = require('path');

module.exports = function(context) {
    console.log(`✅ -- cordova context: ${context}`);
    console.log('Project root directory:', context.opts.projectRoot);
    const exec = require('child_process').exec;

    // Save the current directory
    const initialDir = process.cwd();

    console.log(`✅ -- Initial directory: ${initialDir}`);

    // Change to the desired directory
    process.chdir(path.join(initialDir, 'platforms/android'));

    console.log(`✅ -- New directory to exucute: ${process.cwd()}`);

    // Executing code to genera bundle AAB debug/release
    const gradleCommand = './gradlew --parallel :instant-app:bundleRelease :instant-app:bundleDebug';
    exec(gradleCommand, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            // Change back to the initial directory if needed here
            process.chdir(initialDir);
            return;
        }

        console.log(`📦 --- Bundle SUCCESS instant-app AAB file: ${stdout}`);
        console.log(`📦 --- Bundle WARNING instant-app AAB file: ${stderr}`);

        // Change back to the initial directory after command execution
        process.chdir(initialDir);

        console.log(`✅ -- Current directory after executed: ${process.cwd()}`);

        // Assuming successful completion, execute the module function
        var afterBuildModulePath = path.join(__dirname, 'UploadBinary.js');
        if (fs.existsSync(afterBuildModulePath)) {
            var afterBuildFunction = require(afterBuildModulePath);
            afterBuildFunction(context);
        } else {
            console.error('❌ --- UploadBinary.js script not found.');
        }
    });
};