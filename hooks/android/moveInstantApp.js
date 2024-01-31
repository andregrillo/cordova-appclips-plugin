var fs = require('fs-extra');
var path = require('path');
var AdmZip = require('adm-zip');

module.exports = function(context) {
    var sourcePath = path.join(context.opts.plugin.dir, 'src/android/instant-app.zip');
    var targetPath = path.join(context.opts.projectRoot, 'platforms/android/instant-app.zip');
    var extractPath = path.join(context.opts.projectRoot, 'platforms/android');

    console.log(">>> ✅ Copying instant-app.zip from: " + sourcePath);
    console.log(">>> ✅ To: " + targetPath);

    if (fs.existsSync(sourcePath)) {
        fs.ensureDirSync(path.dirname(targetPath));
        fs.copySync(sourcePath, targetPath);
        console.log('>>> ✅ Instant App ZIP has been successfully copied.');

        // Unzipping the file
        var zip = new AdmZip(targetPath);
        zip.extractAllTo(extractPath, true);
        console.log('>>> ✅  Instant App ZIP has been successfully extracted.');

        // Delete the ZIP file after extraction
        fs.unlinkSync(targetPath);
        console.log('>>> ✅  Instant App ZIP file has been successfully deleted.');
        
    } else {
        console.error('>>> ❌ Source file does not exist: ' + sourcePath);
    }
};