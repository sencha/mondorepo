class VCSBase {
    constructor (opts) {
        Object.assign(this, opts);
    }

    process (repository, branch, path) {
        throw new Error("Not yet implemented");
    }

    available() {
        return true;
    }
}

module.exports = VCSBase;