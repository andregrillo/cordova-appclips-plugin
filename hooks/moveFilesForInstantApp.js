// hooks/moveFilesForInstantApp.js

const fs = require('fs-extra');
const path = require('path');

module.exports = function(context) {
    const projectRoot = context.opts.projectRoot;

    // Define source and destination paths for release-signing-instant-app.properties
    const sourceProps = path.join(projectRoot, 'www', 'instantAppAndroid', 'release-signing-instant-app.properties');
    const destProps = path.join(projectRoot, 'platforms', 'android', 'instant-app', 'release-signing-instant-app.properties');

    // Define source and destination paths for android.keystore
    const sourceKeystore = path.join(projectRoot, 'www', 'instantAppAndroid', 'android.keystore');
    const destKeystore = path.join(projectRoot, 'platforms', 'android', 'instant-app', 'android.keystore');

    console.log('--- ✅ --- android.keystore path '+sourceKeystore);
    console.log('--- ✅ --- release-signing-instant-app.properties path '+sourceKeystore);


    // Move release-signing-instant-app.properties
    fs.move(sourceProps, destProps, { overwrite: true }, function(err) {
        if (err) return console.error('Error moving release-signing-instant-app.properties:', err);
        console.log('--- ✅ --- Moved release-signing-instant-app.properties successfully.');
    });

    // Move android.keystore
    fs.move(sourceKeystore, destKeystore, { overwrite: true }, function(err) {
        if (err) return console.error('Error moving android.keystore:', err);
        console.log('--- ✅ --- Moved android.keystore successfully.');
    });
};
