"use strict";
const chalk = require('chalk');
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

        console.log(chalk.cyan(`Installing Repo '${chalk.magenta(repo.name)}' from '${chalk.yellow(repo.source.repository)}#${chalk.magenta(repo.source.branch)}' into '${chalk.magenta(repo.path)}'`));
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
            console.log(chalk.blue(`Installing Packages for '${chalk.yellow(repo.name)}:${chalk.magenta(pkg.name)}'`));
            install = install.then(() => PackageManagers.npm.install(pkg.path));
        }

        // read the repo from the disk
        return install.then(() => this.installChildren(repo));
    }

}

module.exports = Install;
