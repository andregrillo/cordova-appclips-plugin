// @ts-check

var fs = require('fs');
var path = require('path');
var Q = require('q');
var Config = require("./config");
var {log} = require('./utils')

console.log('\x1b[40m');
log(
  '⭐️ Running copyExtensionFolderToIosProject hook, copying AppClip folder ...',
  'start'
);

// http://stackoverflow.com/a/26038979/5930772
var copyFileSync = function(source, target) {
  var targetFile = target;

  // If target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
};
var copyFolderRecursiveSync = function(source, target) {
  var files = [];

  // Check if folder needs to be created or integrated
  var targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function(file) {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
};

module.exports = function(context) {
  var deferral = new Q.defer();
  var contents = fs.readFileSync(
    path.join(context.opts.projectRoot, 'config.xml'),
    'utf-8'
  );

  var iosFolder = context.opts.cordova.project
    ? context.opts.cordova.project.root
    : path.join(context.opts.projectRoot, 'platforms/ios/');
  fs.readdir(iosFolder, function(err, data) {
    var projectFolder;
    var projectName;
    var srcFolder;
    // Find the project folder by looking for *.xcodeproj
    if (data && data.length) {
      data.forEach(function(folder) {
        if (folder.match(/\.xcodeproj$/)) {
          projectFolder = path.join(iosFolder, folder);
          projectName = path.basename(folder, '.xcodeproj');
        }
      });
    }

    if (!projectFolder || !projectName) {
      log('Could not find an .xcodeproj folder in: ' + iosFolder, 'error');
    }

    // Get the app clip name and location from the parameters or the config file
    var appClipName = Config.EXT_NAME;

    srcFolder = path.join(
      context.opts.plugin.dir,
      "src/ios",
      appClipName + '/'
    );
    if (!fs.existsSync(srcFolder)) {
      log(
        '🚨 Missing CDVAppClips folder in ' + srcFolder + '. Should have the same name as your appClip: ' + appClipName,
        'error'
      );
    }

    // Copy App Clip folder
    copyFolderRecursiveSync(
      srcFolder,
      path.join(context.opts.projectRoot, 'platforms', 'ios')
    );
    log('✅ Successfully copied CDVAppClips folder!', 'success');
    console.log('\x1b[0m'); // reset

    deferral.resolve();
  });

  return deferral.promise;
};
