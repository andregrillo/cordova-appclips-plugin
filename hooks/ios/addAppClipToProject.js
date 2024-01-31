// @ts-check

//var elementTree = require('elementtree');
var fs = require('fs');
var path = require('path');
var plist = require('plist');
var Q = require('q');
var xcode = require('xcode');
var Config = require("./config");
var {log, getCordovaParameter} = require('./utils')

function replacePlaceholdersInPlist(plistPath, placeHolderValues) {
    var plistContents = fs.readFileSync(plistPath, 'utf8');
    for (var i = 0; i < placeHolderValues.length; i++) {
        var placeHolderValue = placeHolderValues[i],
            regexp = new RegExp(placeHolderValue.placeHolder, "g");
        plistContents = plistContents.replace(regexp, placeHolderValue.value);
    }
    fs.writeFileSync(plistPath, plistContents);
}
console.log('\x1b[40m');
log(
  '⭐️ Running addTargetToXcodeProject hook, patching xcode project 🦄 ',
  'start'
);

module.exports = function (context) {
  var deferral = new Q.defer();

  if (context.opts.cordova.platforms.indexOf('ios') < 0) {
    log('🚨 You have to add the ios platform before adding this plugin!', 'error');
  }

  var contents = fs.readFileSync(
    path.join(context.opts.projectRoot, 'config.xml'),
    'utf-8'
  );

  const args = process.argv

  var AppClipAppId;
  for (const arg of args) {  
    if (arg.includes('APPCLIP_APP_ID')){
      var stringArray = arg.split("=");
      AppClipAppId = stringArray.slice(-1).pop();
    }
  }
  
  var ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES = getCordovaParameter("ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES", contents);

  if (contents) {
    contents = contents.substring(contents.indexOf('<'));
  }

  var iosFolder = context.opts.cordova.project
    ? context.opts.cordova.project.root
    : path.join(context.opts.projectRoot, 'platforms/ios/');

  fs.readdir(iosFolder, function (err, data) {
    var projectFolder;
    var projectName;
    var run = function () {
      var pbxProject;
      var projectPath;
      projectPath = path.join(projectFolder, 'project.pbxproj');

      log(
        'Parsing existing project at location: ' + projectPath + ' ...',
        'info'
      );
      if (context.opts.cordova.project) {
        pbxProject = context.opts.cordova.project.parseProjectFile(
          context.opts.projectRoot
        ).xcode;
      } else {
        pbxProject = xcode.project(projectPath);
        pbxProject.parseSync();
      }

      var appClipName = Config.EXT_NAME;
      log('Your appClip will be named: ' + appClipName, 'info');

      var appClipFolder = path.join(iosFolder, appClipName);
      var sourceFiles = [];
      var resourceFiles = [];
      var configFiles = [];
      var projectContainsSwiftFiles = false;
      var addBridgingHeader = false;
      var bridgingHeaderName;
      var addXcconfig = false;
      var xcconfigFileName;
      var xcconfigReference;
      var addEntitlementsFile = false;
      var entitlementsFileName;
      var projectPlistPath = path.join(iosFolder, projectName, projectName + '-Info.plist');
      var projectPlistJson = plist.parse(fs.readFileSync(projectPlistPath, 'utf8'));
      var placeHolderValues = [
        {
          placeHolder: '__DISPLAY_NAME__',
          value: projectPlistJson['CFBundleDisplayName']
        },
        {
          placeHolder: '__APP_IDENTIFIER__',
          value: projectPlistJson['CFBundleIdentifier']
        },
        {
          placeHolder: '__BUNDLE_SUFFIX__',
          value: appClipName
        },
        {
          placeHolder: '__BUNDLE_SHORT_VERSION_STRING__',
          value: projectPlistJson['CFBundleShortVersionString']
        },
        {
          placeHolder: '__BUNDLE_VERSION__',
          value: projectPlistJson['CFBundleVersion']
        }
      ];

      fs.readdirSync(appClipFolder).forEach(file => {
        if (!/^\..*/.test(file)) {
          // Ignore junk files like .DS_Store
          var fileExtension = path.extname(file);
          switch (fileExtension) {
            // Swift and Objective-C source files which need to be compiled
            case '.swift':
              projectContainsSwiftFiles = true;
              sourceFiles.push(file);
              break;
            case '.h':
            case '.m':
              if (file === 'Bridging-Header.h' || file === 'Header.h') {
                addBridgingHeader = true;
                bridgingHeaderName = file;
              }
              sourceFiles.push(file);
              break;
            // Configuration files
            case '.plist':
            case '.entitlements':
            case '.xcconfig':
              if (fileExtension === '.plist') {
                replacePlaceholdersInPlist(path.join(appClipFolder, file), placeHolderValues);
              }
              if (fileExtension === '.xcconfig') {
                addXcconfig = true;
                xcconfigFileName = file;
              }
              if (fileExtension === '.entitlements') {
                replacePlaceholdersInPlist(path.join(appClipFolder, file), placeHolderValues);
                addEntitlementsFile = true;
                entitlementsFileName = file;
              }
              configFiles.push(file);
              break;
            // Resources like storyboards, images, fonts, etc.
            default:
              resourceFiles.push(file);
              break;
          }
        }
      });

      log('Found following files in your App Clip folder:', 'info');
      console.log('Source-files: ');
      sourceFiles.forEach(file => {
        console.log(' - ', file);
      });

      console.log('Config-files: ');
      configFiles.forEach(file => {
        console.log(' - ', file);
      });

      console.log('Resource-files: ');
      resourceFiles.forEach(file => {
        console.log(' - ', file);
      });

      // Add PBXNativeTarget to the project
      var target = pbxProject.addTarget(
        appClipName,
        'app_clip',
        //'app_extension',
        appClipName
      );
      if (target) {
        log('Successfully added PBXNativeTarget!', 'info');
      }

      // Create a separate PBXGroup for the widgets files, name has to be unique and path must be in quotation marks
      var pbxGroupKey = pbxProject.pbxCreateGroup(
        'AppClip',
        '"' + appClipName + '"'
      );
      if (pbxGroupKey) {
        log(
          'Successfully created empty PbxGroup for folder: ' +
          appClipName +
          ' with alias: AppClip',
          'info'
        );
      }

      // Add the PbxGroup to cordova's "CustomTemplate"-group
      var customTemplateKey = pbxProject.findPBXGroupKey({
        name: 'CustomTemplate',
      });
      pbxProject.addToPbxGroup(pbxGroupKey, customTemplateKey);
      log(
        'Successfully added the widgets PbxGroup to cordovas CustomTemplate!',
        'info'
      );

      // Add files which are not part of any build phase (config)
      configFiles.forEach(configFile => {
        var file = pbxProject.addFile(configFile, pbxGroupKey);
        // We need the reference to add the xcconfig to the XCBuildConfiguration as baseConfigurationReference
        if (path.extname(configFile) == '.xcconfig') {
          xcconfigReference = file.fileRef;
        }
      });
      log(
        'Successfully added ' + configFiles.length + ' configuration files!',
        'info'
      );

      // Add a new PBXSourcesBuildPhase for our TodayViewController (we can't add it to the existing one because a today extension is kind of an extra app)
      var sourcesBuildPhase = pbxProject.addBuildPhase(
        [],
        'PBXSourcesBuildPhase',
        'Sources',
        target.uuid
      );
      if (sourcesBuildPhase) {
        log('Successfully added PBXSourcesBuildPhase!', 'info');
      }

      // Add a new source file and add it to our PbxGroup and our newly created PBXSourcesBuildPhase
      sourceFiles.forEach(sourcefile => {
        pbxProject.addSourceFile(
          sourcefile,
          { target: target.uuid },
          pbxGroupKey
        );
      });

      log(
        'Successfully added ' +
        sourceFiles.length +
        ' source files to PbxGroup and PBXSourcesBuildPhase!',
        'info'
      );

      // Add a new PBXFrameworksBuildPhase for the Frameworks used by the widget (NotificationCenter.framework, libCordova.a)
      var frameworksBuildPhase = pbxProject.addBuildPhase(
        [],
        'PBXFrameworksBuildPhase',
        'Frameworks',
        target.uuid
      );
      if (frameworksBuildPhase) {
        log('Successfully added PBXFrameworksBuildPhase!', 'info');
      }

      // Add the frameworks needed by our widget, add them to the existing Frameworks PbxGroup and PBXFrameworksBuildPhase
      var frameworkFile1 = pbxProject.addFramework(
        'NotificationCenter.framework',
        { target: target.uuid }
      );
      var frameworkFile2 = pbxProject.addFramework('libCordova.a', {
        target: target.uuid,
      }); // seems to work because the first target is built before the second one
      if (frameworkFile1 && frameworkFile2) {
        log('Successfully added frameworks needed by the widget!', 'info');
      }

      // Add a new PBXResourcesBuildPhase for the Resources used by the widget (MainInterface.storyboard)
      var resourcesBuildPhase = pbxProject.addBuildPhase(
        [],
        'PBXResourcesBuildPhase',
        'Resources',
        target.uuid
      );
      if (resourcesBuildPhase) {
        log('Successfully added PBXResourcesBuildPhase!', 'info');
      }

      //  Add the resource file and include it into the targest PbxResourcesBuildPhase and PbxGroup
      resourceFiles.forEach(resourcefile => {
        pbxProject.addResourceFile(
          resourcefile,
          { target: target.uuid },
          pbxGroupKey
        );
      });

      log(
        'Successfully added ' + resourceFiles.length + ' resource files!',
        'info'
      );

      // Write the modified project back to disc
      log('Writing the modified project back to disk ...', 'info');
      fs.writeFileSync(projectPath, pbxProject.writeSync());
      log(
        'Added app extension to ' + projectName + ' xcode project',
        'success'
      );
      console.log('\x1b[0m'); // reset

      deferral.resolve();
    };

    if (err) {
      log(err, 'error');
    }

    // Find the project folder by looking for *.xcodeproj
    if (data && data.length) {
      data.forEach(function (folder) {
        if (folder.match(/\.xcodeproj$/)) {
          projectFolder = path.join(iosFolder, folder);
          projectName = path.basename(folder, '.xcodeproj');
        }
      });
    }

    if (!projectFolder || !projectName) {
      log('Could not find an *.xcodeproj folder in: ' + iosFolder, 'error');
    }

    run();
  });

  return deferral.promise;
};
