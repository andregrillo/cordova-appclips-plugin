const xcode = require('xcode'),
      fs = require('fs'),
      path = require('path');

function getAppId(context) {
  var config_xml = path.join(context.opts.projectRoot, 'config.xml');
  var data = fs.readFileSync(config_xml).toString();
  var etree = et.parse(data);
  return etree.getroot().attrib.id;
}

module.exports = function(context) {

    const projectPath = path.join(context.opts.projectRoot, 'platforms/ios', getAppId(context) + '.xcodeproj', 'project.pbxproj');

    const entitlementsPath = path.join(context.opts.projectRoot, 'platforms/ios' + 'CDVAppClips/CDVAppClips.entitlements');
    const targetName = 'CDVAppClips';

    const myProj = xcode.project(projectPath);
    myProj.parseSync();

    // Find the target by name
    let target;
    const targets = myProj.hash.project.objects.PBXNativeTarget;
    for (let key in targets) {
        if (targets[key].name === targetName) {
            target = key;
            break;
        }
    }

    if (!target) {
        console.error('🚨 Target not found:', targetName);
        return;
    }

    // Modify the CODE_SIGN_ENTITLEMENTS setting for your target
    myProj.updateBuildProperty('CODE_SIGN_ENTITLEMENTS', entitlementsPath, target);

    // Write the modified project back to the file
    fs.writeFileSync(projectPath, myProj.writeSync());

    console.log('✅ Updated Xcode build settings for entitlements.');
};
