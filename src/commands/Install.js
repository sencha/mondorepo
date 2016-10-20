"use strict";
require('colors');
const {Command} = require('switchit');
const Repo = require('../Repo');
const VCS = require('../VCS');
const PackageManagers = require('../PackageManagers');

class Install extends Command {
    execute() {
        let repo = Repo.open(process.cwd());
        return this.installRepo(repo.root);
    }

    installRepo(repo) {
        if (repo.manifest && !repo.isRoot) {
            return Promise.resolve(repo);
        }

        if (repo.exists()) {
            return this.installRepoPackages(repo);
        }

        console.log(`Installing Repo '${repo.name}' from '${repo.source.repository}#${repo.source.branch}' into '${repo.path}'`.cyan);
        return VCS.github.clone(repo.source.repository, repo.path, repo.source.branch).then(() => {
            return this.installRepoPackages(repo);
        });
    }

    installChildren(repo) {
        let uses;

        for (let child of repo.uses) {
            if (uses) {
                uses = uses.then(() => this.installRepo(child));
            } else {
                uses = this.installRepo(child);
            }
        }

        if (uses) {
            return uses.then(() => repo);
        }

        return Promise.resolve(repo);
    }

    installRepoPackages(repo) {
        repo.open();

        let install = PackageManagers.npm.install(repo.path);
        let packages = repo.packages;

        for (let pkg of packages) {
            console.log(`Installing Packages for '${repo.name}'`.blue);
            install = install.then(() => PackageManagers.npm.install(pkg.path));
        }

        // read the repo from the disk
        return install.then(() => this.installChildren(repo));
    }

}

module.exports = Install;
