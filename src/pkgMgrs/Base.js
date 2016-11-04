class PackageManager {
    constructor (opts) {
        Object.assign(this, opts);
    }

    install (path) {
        throw new Error("Not yet implemented");
    }

    available() {
        return true;
    }
}
module.exports = PackageManager;
