const fs = require('fs');
const path = require('path');

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

module.exports = function(context) {
    console.log('💡 Updating project.pbxproj for CDVAppClips target 💡');

    const projectRoot = context.opts.projectRoot;
    const ppTeamFilePath = path.join(projectRoot, 'pp_team.json');
    const projectPath = path.join(projectRoot, 'platforms/ios', getProjectName() + '.xcodeproj', 'project.pbxproj');

    try {
        const ppTeamContents = fs.readFileSync(ppTeamFilePath, 'utf8');

        const ppTeamJSON = JSON.parse(ppTeamContents);

        let teamId = ppTeamJSON.DEVELOPMENT_TEAM || '';
        let appClipName = ppTeamJSON.WIDGET_TITLE || '';
        let provProf = '';

        if (ppTeamJSON.PROVISIONING_PROFILES) {
            try {
                // The value of PROVISIONING_PROFILES is a string representation of a JSON object.
                // Replace single quotes with double quotes for valid JSON format and parse it.
                const provisioningProfiles = JSON.parse(ppTeamJSON.PROVISIONING_PROFILES.replace(/'/g, '"'));
                const keys = Object.keys(provisioningProfiles);
                if (keys.length > 0) {
                    provProf = provisioningProfiles[keys[0]];
                } else {
                }
            } catch (e) {
                console.error('🚨 Error parsing PROVISIONING_PROFILES from pp_team.json:', e);
            }
        } else {
            console.log("👉 PROVISIONING_PROFILES not found in pp_team.json");
        }

        let pbxprojContents = fs.readFileSync(projectPath, 'utf8');

        // The string to search for
        const searchString = 'PRODUCT_NAME = "CDVAppClips";';
        const replacementString = `PRODUCT_NAME = "CDVAppClips";\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = "$(PROJECT_DIR)/CDVAppClips/CDVAppClips.entitlements";\n\t\t\t\t"DEVELOPMENT_TEAM[sdk=iphoneos*]" = ${teamId} ;\n\t\t\t\t"PROVISIONING_PROFILE_SPECIFIER[sdk=iphoneos*]" = ${provProf};\n\t\t\t\tPRODUCT_DISPLAY_NAME = "${appClipName}";\n\t\t\t\tSWIFT_OBJC_BRIDGING_HEADER = "";\n\t\t\t\tSWIFT_PRECOMPILE_BRIDGING_HEADER = NO;`;

        // Check if the string exists in the file
        if (pbxprojContents.includes(searchString)) {
            // Replace instances of the search string with the replacement string
            pbxprojContents = pbxprojContents.replace(new RegExp(searchString, 'g'), replacementString);
            console.log('🔍 String found. Updating CODE_SIGN_ENTITLEMENTS.');

            // Write the modified contents back to the file
            fs.writeFileSync(projectPath, pbxprojContents);
            console.log('✅ Successfully updated project.pbxproj for CDVAppClips target.');
        } else {
            console.log('⚠️ String not found. No changes made to project.pbxproj.');
        }
    } catch (error) {
        console.error('🚨 Error:', error);
    }
};
