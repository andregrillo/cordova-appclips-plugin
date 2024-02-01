var fs = require('fs');
var path = require('path');
const xcode = require('xcode')

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

    console.log('⭐️ Removing the SWIFT_OBJC_BRIDGING_HEADER from the App Clip Target');
    pbxPath = path.join(context.opts.projectRoot, 'platforms/ios/',getProjectName() + '.xcodeproj','project.pbxproj');

    let project = xcode.project(pbxPath);
    project.parseSync();

    Object.keys(project.pbxXCBuildConfigurationSection()).forEach((key) => {
        var config = project.pbxXCBuildConfigurationSection()[key];
        console.log('⭐️ config: ' + config);
        if (typeof config === 'object' && config.buildSettings) {
            console.log('⭐️ 1');
            if (config.buildSettings['PRODUCT_NAME'] === 'CDVAppClips') {
                console.log('⭐️ Removing it!');
                delete config.buildSettings['SWIFT_OBJC_BRIDGING_HEADER'];
                delete config.buildSettings['SWIFT_OBJC_INTERFACE_HEADER_NAME'];
            }
        }
    });

    fs.writeFileSync(pbxPath, project.writeSync());


}