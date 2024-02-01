const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    const projectRoot = context.opts.projectRoot;

    console.log('Listing files and subfolders at the root of the project folder:');

    // Read the root directory
    fs.readdir(projectRoot, { withFileTypes: true }, (err, dirents) => {
        if (err) throw err;

        dirents.forEach(dirent => {
            const direntType = dirent.isDirectory() ? 'Directory' : 'File';
            console.log(`${dirent.name} - ${direntType}`);
        });
    });
};
