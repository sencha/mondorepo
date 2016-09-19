var path = require('path');

module.exports = (manifest, manifestDir, repoDir) => {
    let aliases = {},
        uses = manifest.uses,
        usesKeys = Object.keys(uses);

    for (let usesKey of usesKeys) {
        let usesPath = uses[usesKey].path;

        if (usesPath) {
            usesPath = path.resolve(manifestDir, usesPath);
        } else {
            usesPath = path.resolve(repoDir, usesKey);
        }

        aliases[usesKey] = usesPath;
    }

    return aliases;
};
