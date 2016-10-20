const Path = require('path');
const FileUtil = require('./utils/FileUtil.js');

class Package{

    constructor(packageFile) {
        packageFile = FileUtil.absolute(packageFile);

        if (!FileUtil.isFile(packageFile)) {
            packageFile = Path.resolve(packageFile, 'package.json');
        }

        this._packageFile = packageFile;
        this._packagePath = Path.dirname(packageFile);
        this._package = require(packageFile) || {};
        this._name = this._package.name;
    }

    get name() {
        return this._name;
    }

    get path() {
        return this._packagePath;
    }

    get package() {
        return this._package;
    }

    get repo() {
        var repo = this._repo;

        if (!repo) {
            repo = this._repo = this.getRepo(); // get the repo containing this package
        }

        return repo;
    }

    getRepo() {

    }
}

module.exports = Package;
