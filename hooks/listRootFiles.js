// File: hooks/listRootFiles.js

const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    const projectRoot = context.opts.projectRoot;

    // Function to list contents of a directory
    function listDirectoryContents(dirPath, title) {
        console.log(`\nListing ${title}:`);

        fs.readdir(dirPath, { withFileTypes: true }, (err, dirents) => {
            if (err) {
                console.log(`Error reading directory: ${dirPath}`);
                console.log(err.message);
                return;
            }

            dirents.forEach(dirent => {
                const direntType = dirent.isDirectory() ? 'Directory' : 'File';
                console.log(`${dirent.name} - ${direntType}`);
            });
        });
    }

    // List root directory contents
    listDirectoryContents(projectRoot, 'files and subfolders at the root of the project folder');

    // List platforms/ios directory contents, if it exists
    const iosPlatformPath = path.join(projectRoot, 'platforms/ios/build/Debug-iphoneos');
    fs.access(iosPlatformPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log('\nNo iOS platform directory found. Skipping iOS platform listing.');
            return;
        }
        listDirectoryContents(iosPlatformPath, 'files and subfolders in the platforms/ios directory');
    });
};
