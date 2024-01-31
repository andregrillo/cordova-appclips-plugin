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
        // Read and parse the pp_team.json file
        const ppTeamContents = fs.readFileSync(ppTeamFilePath, 'utf8');
        console.log("👉 pp_team.json: \n" + ppTeamContents);

        const ppTeamJSON = JSON.parse(ppTeamContents);
        console.log("👉 ppTeamJSON: \n" + ppTeamJSON);

        const args = process.argv;
        var provisioningProfilesArg;
        var teamId = ppTeamJSON.DEVELOPMENT_TEAM || '';

        for (const arg of args) {
            if (arg.includes('PROVISIONING_PROFILES')) {
                console.log("👉 arg: \n" + arg);
                provisioningProfilesArg = arg.split('=')[1];
                break;
            }
        }

        var provProf = '';
        if (provisioningProfilesArg) {
            try {
                const provisioningProfiles = JSON.parse(provisioningProfilesArg);

                // Extract the first value from the provisioningProfiles object
                const keys = Object.keys(provisioningProfiles);
                console.log("👉 keys: \n" + keys);
                if (keys.length > 0) {
                    provProf = provisioningProfiles[keys[0]];
                    console.log("👉 provProf: \n" + provProf);
                } else {
                    console.log("👉 provProf is null: \n" + provProf);
                }
            } catch (e) {
                console.error('🚨 Error parsing PROVISIONING_PROFILES:', e);
            }
        }

        let pbxprojContents = fs.readFileSync(projectPath, 'utf8');

        // The string to search for
        const searchString = 'PRODUCT_NAME = "CDVAppClips";';
        // Replacement string including the CODE_SIGN_ENTITLEMENTS
        const replacementString = `PRODUCT_NAME = "CDVAppClips";\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = "$(PROJECT_DIR)/CDVAppClips/CDVAppClips.entitlements";\n\t\t\t\t"DEVELOPMENT_TEAM[sdk=iphoneos*]" = ${teamId} ;\n\t\t\t\t"PROVISIONING_PROFILE_SPECIFIER[sdk=iphoneos*]" = ${provProf};`;

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
        console.error('🚨 Error updating project.pbxproj:', error);
    }
};
