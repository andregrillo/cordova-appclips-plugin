var axios;
var base64;
const path = require("path")
const fs = require('fs');
const common = require('./common');
const log = common.log;

module.exports = function(context) {

	if(isCordovaAbove(context,8)){
        axios = require('axios');
        base64 = require('base-64');
	}else{
        base64 = context.requireCordovaModule('base-64');
        axios = context.requireCordovaModule('axios');
	}

	process.chdir(context.opts.projectRoot);

    var mode = 'debug';
	if (context.cmdLine.indexOf('release') >= 0) {
	    mode = 'release';
	}
	
    var projectName = JSON.parse(fs.readFileSync(common.PackageJson).toString()).displayName;

    const plugin = JSON.parse(fs.readFileSync(path.join(context.opts.projectRoot,"plugins", 'fetch.json'),"utf8"))[common.PluginId];

    var encryptedAuth = plugin.variables.CREDENTIALS;
    console.log("✅ -- CREDENTIALS: "+plugin.variables.CREDENTIALS);

    if(encryptedAuth.includes(":")){
        encryptedAuth = "Basic "+base64.encode(encryptedAuth);
    }

    var baseUrl = plugin.variables.WEBSERVICEURL;
    console.log("✅ -- WEBSERVICEURL: "+plugin.variables.WEBSERVICEURL);
    console.log("✅ -- MODE: "+mode);
    console.log("✅ -- encryptedAuth: "+encryptedAuth);

    var bodyFormData = new FormData();
    var binaryFile;
    if(fs.existsSync("platforms/android")){
        if(mode == "release") {
            var instantAppFileRelease = path.join(context.opts.projectRoot, 'platforms/android/instant-app/build/outputs/bundle/release/instant-app-release.aab');
            console.log("✅ -- AAB instant app RELEASE: "+instantAppFileRelease);
            baseUrl += "?type=release&platform=android&name=instant-app-release.aab";
            binaryFile = fs.readFileSync(instantAppFileRelease);
        } else {
            var instantAppFileDebug = path.join(context.opts.projectRoot, 'platforms/android/instant-app/build/outputs/bundle/debug/instant-app-debug.aab');
            console.log("✅ -- AAB instant app DEBUG: "+instantAppFileDebug);
            baseUrl += "?type=debug&platform=android&name=instant-app-debug.aab";
            binaryFile = fs.readFileSync(instantAppFileDebug);
        }

        console.log("✅ -- baseUrl : "+baseUrl);

    } else {
        let out2 = require('child_process').spawnSync("ls", ["platforms/ios/build/Debug-iphoneos"]);
		console.log(out2.status);
		console.log(out2.stdout.toString());
        var file = ""
            
        file = path.join("platforms/ios/build","CDVAppClips.ipa");
        
        //projectName = encodeURIComponent(projectName)
        if(!fs.existsSync(file)){
            log("IPA file doesn't exist!");
            return;
        }else{
            if(mode == "release"){
                baseUrl += "?type=release&platform=ios&name="+"CDVAppClips.ipa";
                binaryFile = fs.readFileSync(file);
            } else {
                baseUrl += "?type=debug&platform=ios&name="+"CDVAppClips.ipa";
                binaryFile = fs.readFileSync(file);
            }
        }
    }

    axios.post(baseUrl,binaryFile,{
        headers:{
            "Authorization": encryptedAuth,
            "Content-Type": "application/octet-stream"
        },
	maxContentLength: Infinity,
	maxBodyLength: Infinity
    }).then((response) => {
        log("Successfully sent file!!");
        console.log("✅ -- Successfully sent file: ");
    }).catch((error) => {
        log("Failed to send file!!");
        console.log("❌ -- Failed to send file: "+error);
        log(error);
    });
}

function isCordovaAbove (context, version) {
	var cordovaVersion = context.opts.cordova.version;
	console.log(cordovaVersion);
	var sp = cordovaVersion.split('.');
	return parseInt(sp[0]) >= version;
}
