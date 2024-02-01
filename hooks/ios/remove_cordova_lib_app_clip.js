const xcode = require('xcode'),
      fs = require('fs'),
      path = require('path'),
      parseString = require('xml2js').parseString;

function getProjectName() {
    const config = fs.readFileSync('config.xml').toString();
    return new Promise((resolve, reject) => {
        parseString(config, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            let name = result.widget.name[0].trim();
            resolve(name);
        });
    });
}

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        getProjectName().then(projectName => {
            console.log(`Project Name: ${projectName}`);
            const projectPath = path.join(context.opts.projectRoot, 'platforms', 'ios', `${projectName}.xcodeproj/project.pbxproj`);
            const myProj = xcode.project(projectPath);

            myProj.parseSync();

            // Search for the PBXFrameworksBuildPhase section
            const frameworksBuildPhases = myProj.hash.project.objects['PBXFrameworksBuildPhase'];

            Object.keys(frameworksBuildPhases).forEach((key) => {
                const phase = frameworksBuildPhases[key];
                // Check if this phase contains only two frameworks
                if (phase.files && phase.files.length === 2) {
                    phase.files = phase.files.filter(file => !file.comment.includes('libCordova.a'));
                }
            });

            fs.writeFileSync(projectPath, myProj.writeSync());
            resolve();
        }).catch(error => {
            console.error(`Error: ${error}`);
            reject(error);
        });
    });
};
