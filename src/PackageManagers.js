const Npm = require('./pkgMgrs/Npm');
const Yarn = require('./pkgMgrs/Yarn');

class PackageManagers {
    static configure (opts) {
        PackageManagers._opts = opts;
    }

    static registerPackageManager (name, packageManager) {
        let me = PackageManagers;
        me._managers[name] = packageManager;
        me[name] = () => new me._managers[name](me._opts);
    }
}

PackageManagers._managers = {};

PackageManagers.registerPackageManager('npm', Npm);
PackageManagers.registerPackageManager('yarn', Yarn);

module.exports = PackageManagers;