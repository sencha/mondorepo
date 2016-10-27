"use strict";
const Path = require('path');
const fs = require("fs");

const mkdirp = require('mkdirp');
const cwd = process.cwd();

class FileUtil {

    static absolute(filepath) {
        if (!Path.isAbsolute(filepath)) {
            return Path.resolve(cwd, filepath);
        }

        return filepath;
    }

    static findClosestPackage(dir) {
        let testDir = Path.resolve(dir, 'package.json');
        if (FileUtil.exists(testDir)) {
            return testDir;
        } else {
            let parent = Path.resolve(dir, '..');
            if (dir !== parent) {
                return FileUtil.findClosestPackage(parent);
            }
        }
    }

    /**
     * @param file
     * @returns {boolean}
     */
    static exists(file) {
        try {
            fs.accessSync(file, fs.F_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    static isFile(path) {
        if (FileUtil.exists(path)) {
            return fs.lstatSync(path).isFile();
        }
    }

    static mkdirp (path) {
        mkdirp.sync(path);
    }
}

module.exports = FileUtil;
