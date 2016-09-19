"use strict";

let path = require('path'),
    fs = require('fs');

module.exports = (manifest, manifestDir) => {
    let packageJsonFile = path.resolve(manifestDir, 'package.json'), isNodePackage;

    try {
        fs.accessSync(packageJsonFile, fs.R_OK);
        isNodePackage = true;
    } catch (e) {
        // Not a node package, no package.json file
    }

    if (isNodePackage) {
        let packageData = require(packageJsonFile),
            name = packageData.name || manifest.name;

        if (packageData && name) {
            return {
                [name]: manifestDir
            };
        }
    }

    return {};
};
