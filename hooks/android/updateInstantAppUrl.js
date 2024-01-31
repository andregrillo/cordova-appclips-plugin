// hooks/updateInstantAppUrl.js

var fs = require('fs-extra');
var path = require('path');
var xml2js = require('xml2js');

module.exports = function(context) {
    const args = process.argv;
    var APP_INSTANT_CLIPS_URL;

    for (const arg of args) {  
      if (arg.includes('APP_INSTANT_CLIPS_URL')){
        var stringArray = arg.split("=");
        APP_INSTANT_CLIPS_URL = stringArray.slice(-1).pop();
      }
    }

    console.log("✅ >>>>>  APP_INSTANT_CLIPS_URL : " + APP_INSTANT_CLIPS_URL);

    var stringsXmlPath = path.join(context.opts.projectRoot, "platforms", "android", "instant-app", "src", "main", "res", "values", "strings.xml");
    console.log("✅ >>>>>  stringsXmlPath : " + stringsXmlPath);

    fs.readFile(stringsXmlPath, 'utf8', function(err, data) {
        if (err) {
            console.error("❌ Error reading strings.xml: ", err);
            return;
        }

        xml2js.parseString(data, function(err, result) {
            if (err) {
                console.error("❌ Error parsing strings.xml: ", err);
                return;
            }

            if(result.resources.string) {
                result.resources.string.forEach(function(str) {
                    if (str.$.name === 'app_instant_clips_url') {
                        str._ = APP_INSTANT_CLIPS_URL;
                    }
                });
            }

            var builder = new xml2js.Builder();
            var xml = builder.buildObject(result);

            fs.writeFile(stringsXmlPath, xml, function(err) {
                if (err) {
                    console.error("❌ Error writing strings.xml: ", err);
                } else {
                    console.log("✅ strings.xml successfully updated!");
                }
            });
        });
    });
};