const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    console.log('💡 Updating project.pbxproj for CDVAppClips target 💡');

    const projectRoot = context.opts.projectRoot; // Adjust this path as needed
    const projectPath = path.join(projectRoot, 'platforms/ios', 'YourProjectName.xcodeproj', 'project.pbxproj'); // Replace 'YourProjectName' with your actual project name

    try {
        let pbxprojContents = fs.readFileSync(projectPath, 'utf8');

        // The string to search for
        const searchString = 'PRODUCT_NAME = CDVAppClips;';
        // Replacement string including the CODE_SIGN_ENTITLEMENTS
        const replacementString = 'PRODUCT_NAME = CDVAppClips;\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = "$(PROJECT_DIR)/CDVAppClips/CDVAppClips.entitlements";';

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
