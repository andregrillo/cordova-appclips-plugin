var fs = require('fs');
var path = require('path');

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

module.exports = function (context) {

    const appclipPath = path.join(context.opts.projectRoot, 'platforms/ios/CDVAppClips');

    //Rename the files back to normal
    const filesToRename = {
        'main2.m': 'main.m',
        'AppDelegate2.m': 'AppDelegate.m',
        'AppDelegate2.h': 'AppDelegate.h',
      };

    fs.readdir(appclipPath, (err, files) => {
        if (err) {
          console.error('Error reading AppClip directory:', err);
          return;
        }

        files.forEach(file => {
          if (filesToRename[file]) {
            const oldPath = path.join(appclipPath, file);
            const newPath = path.join(appclipPath, filesToRename[file]);

            fs.rename(oldPath, newPath, (err) => {
              if (err) {
                console.error(`🚨 Error renaming file ${file}:`, err);
              } else {
                console.log(`✅ Renamed ${file} to ${filesToRename[file]}`);
              }
            });
          }
        });
    });

    const projectPath = path.join(context.opts.projectRoot, 'platforms/ios', getProjectName() + '.xcodeproj', 'project.pbxproj');
    let pbxprojContents = fs.readFileSync(projectPath, 'utf8')
    pbxprojContents = pbxprojContents.replace('AppDelegate2.m', 'AppDelegate.m');
    pbxprojContents = pbxprojContents.replace('AppDelegate2.h', 'AppDelegate.h');
    pbxprojContents = pbxprojContents.replace('main2.m', 'main.m');

    // Write the modified contents back to the file
    fs.writeFileSync(projectPath, pbxprojContents);
    console.log('✅ Renamed all files for CDVAppClips target.');

}