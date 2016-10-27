class PackageManager {
    constructor (opts) {
        opts = opts || {};
        Object.assign(this, {
            debug: false
        }, opts);
    }

    install (path) {
        throw new Error("Not yet implemented");
    }
}
module.exports = PackageManager;