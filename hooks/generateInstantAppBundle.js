var fs = require('fs-extra');
var path = require('path');
const exec = require('child_process').exec;

exec('cd platforms/android && ./gradlew --parallel :instant-app:bundleRelease', (err, stdout, stderr) => {
    if (err) {
        console.error(`exec error: ${err}`);
        return;
    }

    console.log(`>>> 📦 ✅ Bundle SUCCESS instant-app AAB file: ${stdout}`);
    console.log(`>>> 📦 Bundle WARNING instant-app AAB file: ${stderr}`);
});