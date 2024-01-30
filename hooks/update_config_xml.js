#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var et = require('elementtree'); 

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
    var rootdir = context.opts.projectRoot;
    var configFilePath = path.join(rootdir, 'platforms/ios/', getProjectName(), 'config.xml');
    const args = process.argv

    var provisioningProfile;
    for (const arg of args) {  
      if (arg.includes('PROVISIONING_PROFILES')){
        var stringArray = arg.split("=");
        provisioningProfile = stringArray.slice(-1).pop();
      }
    }

    // Check if config.xml file exists
    if (fs.existsSync(configFilePath)) {
        var configContent = fs.readFileSync(configFilePath, 'utf8');

        // Replace the placeholder
        var result = configContent.replace('--PLACEHOLDER--', provisioningProfile);

        // Write the changes back to config.xml
        fs.writeFileSync(configFilePath, result, 'utf8');
        console.error('✅ config.xml edited successfuly');
    } else {
        console.error('🚨 config.xml not found');
    }
};
