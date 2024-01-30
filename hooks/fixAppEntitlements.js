// @ts-check

var elementTree = require('elementtree');
var fs = require('fs');
var path = require('path');
var Q = require('q');
var {log} = require('./utils')

function removeDuplicateSubsequentLines(string) {
  var lineArray = string.split('\n');
  return lineArray.filter((line, idx) => {
    return idx === 0 || ( line !== lineArray[idx - 1] )
  }).join('\n');
}

function replacePlaceholdersInPlist(plistPath, placeHolderValues) {
    var plistContents = fs.readFileSync(plistPath, 'utf8');
    for (var i = 0; i < placeHolderValues.length; i++) {
        var placeHolderValue = placeHolderValues[i],
            regexp = new RegExp(placeHolderValue.placeHolder, "g");
        plistContents = plistContents.replace(regexp, placeHolderValue.value);
        plistContents = removeDuplicateSubsequentLines(plistContents);
    }
    fs.writeFileSync(plistPath, plistContents);
}

console.log('\x1b[40m');
log('Running fixAppEntitlements hook, fixing the app entitlements 🦄 ', 'start');

module.exports = function (context) {
  var deferral = new Q.defer();

  if (context.opts.cordova.platforms.indexOf('ios') < 0) {
    log('You have to add the ios platform before adding this plugin!', 'error');
    deferral.resolve();
    return deferral.promise;
  }

  var contents = fs.readFileSync(path.join(context.opts.projectRoot, 'config.xml'), 'utf-8');
  if (contents) {
    contents = contents.substring(contents.indexOf('<'));
  }

  // Get the bundle-id from config.xml
  var etree = elementTree.parse(contents);
  var bundleId = etree.getroot().get('id');

  var iosFolder = context.opts.cordova.project
    ? context.opts.cordova.project.root
    : path.join(context.opts.projectRoot, 'platforms/ios/');

  fs.readdir(iosFolder, function (err, data) {
    if (err) {
      log(err, 'error');
      deferral.reject(err);
      return;
    }

    var projectName;
    var targetFolderName = 'CDVAppClips'; // Set this to the name of the target you want to manipulate

    // Find the project folder by looking for *.xcodeproj
    if (data && data.length) {
      data.forEach(function (folder) {
        if (folder.match(/\.xcodeproj$/)) {
          projectName = path.basename(folder, '.xcodeproj');
        }
      });
    }

    if (!projectName) {
      log('Could not find an *.xcodeproj folder in: ' + iosFolder, 'error');
      deferral.reject('Project not found');
      return;
    }

    var placeHolderValues = [
      {
        placeHolder: '__APP_IDENTIFIER__',
        value: bundleId
      }
    ];

    // Update entitlements for the specific target
    ['Debug', 'Release'].forEach(config => {
      var entitlementsPath = path.join(iosFolder, projectName, targetFolderName, 'AppClip.entitlements');
      if (fs.existsSync(entitlementsPath)) {
        replacePlaceholdersInPlist(entitlementsPath, placeHolderValues);
        log('⭐️ Successfully updated entitlements for target: ' + targetFolderName, 'success');
      } else {
        log('🚨 Entitlements file not found: ' + entitlementsPath, 'warning');
      }
    });

    console.log('\x1b[0m'); // reset

    deferral.resolve();
  });

  return deferral.promise;
};
