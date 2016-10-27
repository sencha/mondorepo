const Npm = require('./pkgMgrs/Npm');
const Yarn = require('./pkgMgrs/Yarn');

class PackageManagers {
    constructor () {
        this._managers = {};
    }

    configure (opts) {
        this._opts = opts;
    }

    registerPackageManager (name, packageManager) {
        let me = this;
        me._managers[name] = packageManager;
        me[name] = () => new me._managers[name](me._opts);
    }
}

let collection = new PackageManagers();

collection.registerPackageManager('npm', Npm);
collection.registerPackageManager('yarn', Yarn);

module.exports = collection;