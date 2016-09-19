"use strict";
let path = require('path'),
    fs = require('fs'),
    constants = require('./constants'),
    cwd = process.cwd();

module.exports = {
    getManifestFile(root = cwd) {
        let manifestFile, stats;

        if (typeof root === 'function') {
            root = root();
        }

        root = path.resolve(cwd, root);
        stats = fs.statSync(root);
        manifestFile = path.resolve(root, constants.manifest);

        try {
            fs.accessSync(manifestFile, fs.R_OK);
            return manifestFile;
        } catch (e) {
            console.log(`unable to find/read mondo manifest at ${manifestFile}`);
        }
    }
};
