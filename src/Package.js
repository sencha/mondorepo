const Path = require('path');
const FileUtil = require('./utils/FileUtil.js');

class Package {

    constructor(packageFile, repo) {
        packageFile = FileUtil.absolute(packageFile);

        if (!FileUtil.isFile(packageFile)) {
            packageFile = Path.resolve(packageFile, 'package.json');
        }

        this._packageFile = packageFile;
        this._packagePath = Path.dirname(packageFile);
        this._package = require(packageFile) || {};
        this._basePath = Path.resolve(this.path, ((this._package && this._package.mondo && this._package.mondo.base) || '.'));
        this._name = this._package.name;
        this._repo = repo;
    }

    get name() {
        return this._name;
    }

    get path() {
        return this._packagePath;
    }

    get base() {
        return this._basePath;
    }

    get package() {
        return this._package;
    }

    get repo() {
        return this._repo;
    }
}

module.exports = Package;
