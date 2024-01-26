console.log("⭐️ Running hook to install custom cordova-node-xcode lib");

const child_process = require('child_process');
const path = require('path');

const customXcodeRepo = 'https://github.com/andregrillo/cordova-node-xcode.git'; // Replace with your GitHub username and repository name
const customXcodeBranch = 'app_clips'; // Replace with the branch containing your modifications

const customXcodePath = path.join(__dirname, 'node_modules', 'cordova-node-xcode');

try {
  const stdout = child_process.execSync(`npm install ${customXcodeRepo}#${customXcodeBranch}`, { cwd: __dirname, stdio: 'pipe' });
  console.log(stdout.toString()); // Convert buffer to string for logging
  console.log('✅ Custom cordova-node-xcode installed successfully.');
  
} catch (error) {
  console.error('🚨 Installation error:', error.message);
  process.exit(1); // Exit with an error code
}
