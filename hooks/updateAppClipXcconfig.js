
var fs = require('fs');
var path = require('path');
var Config = require("./config");
var {getCordovaParameter, log} = require('./utils');
var decode = require('decode-html');

function getAppId(context) {
  var config_xml = path.join(context.opts.projectRoot, 'config.xml');
  var data = fs.readFileSync(config_xml).toString();
  var etree = et.parse(data);
  return etree.getroot().attrib.id;
}

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

    var appId = getAppId(context);
    var configXmlPath = path.join(context.opts.projectRoot, "platforms", "ios", appId, "Classes", "AppDelegate.h");
    console.log("✅ configXmlPath: " + configXmlPath);    
    if (fs.existsSync(configXmlPath)) {
     
      fs.readFile(configXmlPath, 'utf8', function (err,data) {
        
        if (err) {
          throw new Error('🚨 Unable to read config.xml: ' + err);
        }
        
        var result = data;
        var shouldBeSaved = false;

        if (data.includes("--PLACEHOLDER--")){
          shouldBeSaved = true;
          result = data.replace(/--PLACEHOLDER--/g, ppDecoded);
        } else {
          console.log("🚨 Placeholder not found!");
        }

        if (shouldBeSaved){
          fs.writeFile(configXmlPath, result, 'utf8', function (err) {
          if (err) 
            {throw new Error('🚨 Unable to write into config.xml: ' + err);}
          else 
            {console.log("✅ config.xml edited successfuly");}
        });
        }

      });
    } else {
        throw new Error("🚨 WARNING: config.xml was not found. The build phase may not finish successfuly");
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
