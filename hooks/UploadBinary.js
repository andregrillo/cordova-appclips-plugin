var axios;
var base64;
const path = require("path")
const fs = require('fs');
const common = require('../hooks/common');
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
    if(encryptedAuth.includes(":")){
        encryptedAuth = "Basic "+base64.encode(encryptedAuth);
    }
    var baseUrl = plugin.variables.WEBSERVICEURL;
    console.log("✅ >>>>>> WEBSERVICEURL: "+plugin.variables.WEBSERVICEURL);

    //let form = new FormData();
    var binaryFile;
    if(fs.existsSync("platforms/android")){
        projectName = encodeURIComponent(projectName)
        console.log("✅ >>>>>> projectName: "+projectName);

        if(mode == "release"){
            var instantAppFileRelease = path.join(context.opts.projectRoot, 'platforms/android/instant-app/release/instant-app-release.aab');
            console.log("✅ >>>>>> AAB instant app release: "+instantAppFileRelease);
            baseUrl += "?type=release&platform=android&name="+projectName;
            binaryFile = fs.readFileSync(instantAppFileRelease);
        }else{
            var instantAppFileDebug = path.join(context.opts.projectRoot, 'platforms/android/instant-app/debug/instant-app-release.aab');
            console.log("✅ >>>>>> AAB instant app release: "+instantAppFileDebug);
            baseUrl += "?type=debug&platform=android&name="+projectName;
            binaryFile = fs.readFileSync(instantAppFileDebug);
        }

        console.log("✅ >>>>>> Binary Path file: "+binaryFile);
        console.log("✅ >>>>>> baseUrl : "+baseUrl);

    }else{
        let out2 = require('child_process').spawnSync("ls", ["platforms/ios/mdx"]);
		console.log(out2.status);
		console.log(out2.stdout.toString());
        var file = ""
        var embedIPA = plugin.variables.EMBEDIPA;
        if(embedIPA.toLowerCase() === "true"){
            file = path.join("platforms/ios/mdx",projectName+"-exported.mdx")
        }else{
            file = path.join("platforms/ios/mdx",projectName+".mdx");
        }
        projectName = encodeURIComponent(projectName)
        if(!fs.existsSync(file)){
            log("MDX file doesn't exist!");
            return;
        }else{
            if(mode == "release"){
                baseUrl += "?type=release&platform=ios&name="+projectName;
                binaryFile = fs.readFileSync(file);
            }else{
                baseUrl += "?type=debug&platform=ios&name="+projectName;
                binaryFile = fs.readFileSync(file);
            }
        }
    }
    axios.post(baseUrl,binaryFile,{
        headers:{
            "Authorization": encryptedAuth
        },
	maxContentLength: Infinity,
	maxBodyLength: Infinity
    }).then((response)=>{
        log("Successfully sent file!!");
        console.log("✅ >>>>>> Successfully sent file!! ");
    }).catch((error)=>{
        log("Failed to send file!!");
        console.log("❌ >>>>>> Failed to send file "+error);
        log(error);
    });
}

function isCordovaAbove (context, version) {
	var cordovaVersion = context.opts.cordova.version;
	console.log(cordovaVersion);
	var sp = cordovaVersion.split('.');
	return parseInt(sp[0]) >= version;
}