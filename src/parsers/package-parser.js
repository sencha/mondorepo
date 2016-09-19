"use strict";
let path = require('path'),
    glob = require("glob"),
    constants = require('../constants');

module.exports = (manifest, manifestDir) => {
    let packages = manifest && manifest.packages, aliases = {};
    if (manifest && manifestDir) {

        // Default packages if empty
        if (!packages) packages = Array.from(constants.packages);

        // Convert packages string to array
        if (!Array.isArray(packages)) {
            packages = [packages];
        }

        // final all package.json files inside of all packages and alias them by name
        for (let pkg of packages) {
            let packageRoot = path.resolve(manifestDir, pkg),
                npmPackages = glob.sync(`${packageRoot}/**/package.json`);

            for (let npmPackage of npmPackages) {
                let npmPackageRoot = path.dirname(npmPackage),
                    npmPackageData = require(npmPackage),
                    npmPackageName = npmPackageData.name;

                if (npmPackageName) {
                    aliases[npmPackageName] = npmPackageRoot;
                }
            }
        }
    }

    return aliases;
};
