var fs = require('fs');
var path = require('path');
var plist = require('plist');
var Config = require("./config");
var { getCordovaParameter } = require('./utils')

  
module.exports = function (context) {

    var contents = fs.readFileSync(
        path.join(context.opts.projectRoot, 'config.xml'),
        'utf-8'
    );

    var iosFolder = context.opts.cordova.project
    ? context.opts.cordova.project.root
    : path.join(context.opts.projectRoot, 'platforms/ios/');

    var appClipName = Config.EXT_NAME;
    var appClipPlistPath = path.join(iosFolder, appClipName, appClipName + '-Info.plist');

    var xml = fs.readFileSync(appClipPlistPath, 'utf8');
    var obj = plist.parse(xml);

    //obj.WebViewUrl =  getCordovaParameter("WEBVIEW_URL",contents);

    xml = plist.build(obj);
    fs.writeFileSync(appClipPlistPath, xml, { encoding: 'utf8' });
}

