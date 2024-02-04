#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the path to the exportOptionsAppClips.plist file
const filePath = path.join(context.opts.projectRoot, 'plugins', 'cordova.appclips.plugin', 'src', 'ios', 'exportOptionsAppClip.plist');

const args = process.argv

console.log('⭐️ cmdLine: ' + context.cmdLine);

var buildMode = 'development';
if (context.cmdLine.indexOf('release') >= 0) {
    buildMode = 'app-store';
}

var provisioningProfile = "";
var bundleId = "";

for (const arg of args) {  
  if (arg.includes('APPCLIP_APP_ID')){
    var stringArray = arg.split("=");
    bundleId = stringArray.slice(-1).pop();
  } 
  
  else if (arg.includes('PROVISIONING_PROFILES')){
    var provisioningProfileString = arg.split("=");

    // Parse the JSON string into a JavaScript object
    const parsedObject = JSON.parse(provisioningProfileString);

    // Iterate through the object's keys and access their values
    for (const key in parsedObject) {
      if (parsedObject.hasOwnProperty(key)) {
        provisioningProfile = parsedObject[key];
        console.log(`Key: ${key}, Value: ${value}`);
      }
    }
  } 
}

if (bundleId === "" || provisioningProfile === ""){
  throw new Error("🚨 Error: Both bundleId and provisioningProfile must be provided.");
}

// Define the replacement text for the placeholders
const placeholder1 = buildMode;
const placeholder2 = bundleId;
const placeholder3 = provisioningProfile;

// Read the file contents
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading ${filePath}:`, err);
    return;
  }

  // Replace the placeholders with the desired text
  data = data.replace('--PLACEHOLDER1--', placeholder1);
  data = data.replace('--PLACEHOLDER2--', placeholder2);
  data = data.replace('--PLACEHOLDER3--', placeholder3);

  // Write the modified content back to the file
  fs.writeFile(filePath, data, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing ${filePath}:`, err);
      return;
    }

    console.log(`Successfully updated ${filePath}`);
  });
});
