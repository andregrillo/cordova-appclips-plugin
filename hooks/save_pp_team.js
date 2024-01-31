const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        const rootDir = context.opts.projectRoot; 
        const filePath = path.join(rootDir, 'pp_team.json'); 
        const args = process.argv;

        var provisioningProfile;
        var teamId;

        for (const arg of args) {  
          if (arg.includes('PROVISIONING_PROFILES')){
            var stringArray = arg.split("=");
            provisioningProfile = stringArray.slice(-1).pop();
          }

          if (arg.includes('DEVELOPMENT_TEAM')){
            var stringArray = arg.split("=");
            teamId = stringArray.slice(-1).pop();
          }
        }

        // Creating a JSON object with uppercase keys
        const jsonObject = {
            PROVISIONING_PROFILES: provisioningProfile,
            DEVELOPMENT_TEAM: teamId
        };

        // Convert JSON object to string
        const textContent = JSON.stringify(jsonObject, null, 4); // 4 spaces for pretty printing

        // Write the JSON string to the file
        fs.writeFile(filePath, textContent, 'utf8', (err) => {
            if (err) {
                console.error('🚨 Error writing pp_team.json:', err);
                reject(err); 
            } else {
                console.log('✅ pp_team.json file saved:', filePath);
                resolve(); 
            }
        });
    });
};
