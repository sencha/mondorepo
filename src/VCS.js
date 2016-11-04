const Git = require('./vcs/Git');

class VCS {
    static configure (opts) {
        VCS._opts = opts;
    }

    static registerVCS (name, vcs) {
        let me = VCS;
        me._systems[name] = vcs;
        me[name] = () => new me._systems[name](me._opts);
    }
}

VCS._systems = {};
VCS.registerVCS('git', Git);

module.exports = VCS;