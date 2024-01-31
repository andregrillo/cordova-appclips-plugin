const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        const rootDir = context.opts.projectRoot; 
        const filePath = path.join(rootDir, 'provisioning-profiles.txt'); 
        const args = process.argv

        var provisioningProfile;
        for (const arg of args) {  
          if (arg.includes('PROVISIONING_PROFILES')){
            var stringArray = arg.split("=");
            provisioningProfile = stringArray.slice(-1).pop();
          }
        }

        const textContent = provisioningProfile; 

        // Write the text file
        fs.writeFile(filePath, textContent, 'utf8', (err) => {
            if (err) {
                console.error('🚨 Error writing provisioning-profiles.txt:', err);
                reject(err); 
            } else {
                console.log('✅ provisioning-profiles.txt file saved:', filePath);
                resolve(); 
            }
        });
    });
};
