
var fs = require('fs');
var path = require('path');
var Config = require("./config");
var {getCordovaParameter, log} = require('./utils');
var decode = require('decode-html');

module.exports = function(context) {
    log(
    'Running updateAppClipXcconfig hook, adding sign info to Config.xcconfig 🦄 ',
    'start'
    );

     var iosFolder = context.opts.cordova.project
    ? context.opts.cordova.project.root
    : path.join(context.opts.projectRoot, 'platforms/ios/');

    var appClipName = Config.EXT_NAME;
    var xcConfigPath = path.join(iosFolder, appClipName, 'Config.xcconfig');

    var contents = fs.readFileSync(
        path.join(context.opts.projectRoot, 'config.xml'),
        'utf-8'
    );

    const args = process.argv

    var ppDecoded;
    for (const arg of args) {  
      if (arg.includes('PROVISIONING_PROFILES')){
        var stringArray = arg.split("=");
        ppDecoded = stringArray.slice(-1).pop();
      }
    }

    var ppObject = JSON.parse(ppDecoded.replace(/'/g, "\""));

    //we don't iterate the provisioning profiles here because we don't know  
    //yet how to add multiple provisioning profile info to the same xcconfig. 
    //Maybe we can't do it and we need different xcconfig for multiple extensions?
    var key = Object.keys(ppObject)[0];
    var value = ppObject[key];

    var xcConfigNewContents = 'PRODUCT_BUNDLE_IDENTIFIER=' + key + '\n'
                            + 'PROVISIONING_PROFILE=' + value + '\n'
                            + 'DEVELOPMENT_TEAM=' + getCordovaParameter("DEVELOPMENT_TEAM",contents) + "\n"
                            + 'PRODUCT_DISPLAY_NAME=' + getCordovaParameter("WIDGET_TITLE",contents)

    
    fs.appendFileSync(xcConfigPath, xcConfigNewContents);

    log('Successfully edited Config.xcconfig', 'success');
}
