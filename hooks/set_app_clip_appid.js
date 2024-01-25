var fs = require('fs'), path = require('path');

module.exports = function(context) {
    var appDelegate = path.join(context.opts.projectRoot, "platforms", "ios", "CDVAppClips", "CDVAppClips-Info.plist");
    console.log("✅ AppClips-Info.plist: " + appDelegate);    
    if (fs.existsSync(appDelegate)) {
     
      fs.readFile(appDelegate, 'utf8', function (err,data) {
        
        if (err) {
          throw new Error('🚨 Unable to read AppClips-Info.plist: ' + err);
        }
        
        var result = data;
        var shouldBeSaved = false;

        const args = process.argv

	    var APPCLIP_APP_ID;
	    for (const arg of args) {  
	      if (arg.includes('APPCLIP_APP_ID')){
	        var stringArray = arg.split("=");
	        APPCLIP_APP_ID = stringArray.slice(-1).pop();
	      }
	    }

        if (data.includes("$(PRODUCT_BUNDLE_IDENTIFIER)")){
          shouldBeSaved = true;
          result = data.replace(/$(PRODUCT_BUNDLE_IDENTIFIER)/g, APPCLIP_APP_ID);
        } else {
          console.log("🚨 AppClips-Info.plist already modified or invalid!");
        }

        if (shouldBeSaved){
          fs.writeFile(appDelegate, result, 'utf8', function (err) {
          if (err) 
            {throw new Error('🚨 Unable to write into AppClips-Info.plist: ' + err);}
          else 
            {console.log("✅ AppClips-Info.plist edited successfuly");}
        });
        }

      });
    } else {
        throw new Error("🚨 WARNING: AppClips-Info.plist was not found. The build phase may not finish successfuly");
    }
  }
