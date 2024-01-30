const fs = require('fs');
const path = require('path');

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
    console.log('💡 Updating project.pbxproj for CDVAppClips target 💡');

    const projectRoot = context.opts.projectRoot; // Adjust this path as needed
    const projectPath = path.join(projectRoot, 'platforms/ios', getProjectName() + '.xcodeproj', 'project.pbxproj');

    try {
        let pbxprojContents = fs.readFileSync(projectPath, 'utf8');

        // Regular expression to identify build configuration sections for the CDVAppClips target
        const regex = /isa = XCBuildConfiguration;[^}]*?PRODUCT_NAME = CDVAppClips;[^}]*?\};/g;

        // Replacement string including the CODE_SIGN_ENTITLEMENTS
        const entitlementString = '\t\t\t\tCODE_SIGN_ENTITLEMENTS = "$(PROJECT_DIR)/CDVAppClips/CDVAppClips.entitlements";\n';

        // Function to add the entitlement string to the matched section
        function addEntitlements(match) {
            if (match.includes('CODE_SIGN_ENTITLEMENTS')) {
                // If the line already exists, don't add it again
                return match;
            }
            return match.replace(/(buildSettings = \{)/, `$1\n${entitlementString}`);
        }

        // Apply the modification
        pbxprojContents = pbxprojContents.replace(regex, addEntitlements);

        // Write the modified contents back to the file
        fs.writeFileSync(projectPath, pbxprojContents);
        console.log('✅ Successfully updated project.pbxproj for CDVAppClips target.');
    } catch (error) {
        console.error('🚨 Error updating project.pbxproj:', error);
    }
};
