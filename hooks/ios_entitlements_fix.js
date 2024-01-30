const xcode = require('xcode'),
      fs = require('fs'),
      path = require('path'),
      et = require('elementtree'); 

function getProjectName() {
    var config = fs.readFileSync('config.xml').toString();
    var parseString = require('xml2js').parseString;
    var name;
    parseString(config, function (err, result) {
        name = result.widget.name.toString();
        const r = /\B\s+|\s+\B/g;  //Removes trailing and leading spaces
        name = name.replace(r, '');
    });
    return name || null;
}

module.exports = function(context) {

    console.log('💡 Setting AppClips Entitlements 💡');

    const projectPath = path.join(context.opts.projectRoot, 'platforms/ios', getProjectName() + '.xcodeproj', 'project.pbxproj');

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
