"use strict";
const Path = require('path');
const os = require('os');
module.exports = {
    manifest: 'package.json',
    child: '.mondo.json',
    install: 'mondo_repos',
    packages: ['.'],
    branch: 'master',
    type: 'github',
    repo: 'repo',
    home: Path.resolve(os.homedir(), '.mondo'),
    settings: 'settings.json',
    forkedRepoName: 'upstream'
};
