"use strict";
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const chalk = require('chalk');
const {Command} = require('switchit');
const ora = require('ora');

const constants = require('../constants');
const Repo = require('../Repo');
const VCS = require('../VCS');
const PackageManagers = require('../PackageManagers');
const Logger = require('..//utils/Logger');

const FileUtil = require('../utils/FileUtil');
const settingsPath = path.resolve(constants.home, constants.settings);

class Install extends Command {
    beforeExecute (params) {
        super.beforeExecute(params);
        this.debug = this.root().debug;
    }

    execute(params) {
        let me = this;
        params.verbose = params.verbose || me.debug;
        PackageManagers.configure({
            debug: params.verbose
        });

        me.binDirs = [];
        me.wrappedBins = [];

        me.packageManager = PackageManagers.yarn;
        if (FileUtil.exists(settingsPath)) {
            const settings = require(settingsPath);
            if (!!settings.useNpm) {
                me.packageManager = PackageManagers.npm;
            }
        }

        let repo = Repo.open(process.cwd());
        return me.installRepo(repo.root).then(() => {
            if (me.wrappedBins.length > 0) {
                let message = 'Linking local binaries';
                Logger.debug(message);
                if (me.spinner) {
                    me.spinner.succeed();
                    me.spinner.text = message;
                    me.spinner.start();
                }
                me.wrappedBins.forEach(function (wrappedBin) {
                    let message = `- Linking '${chalk.green(wrappedBin.name)}'`;
                    Logger.debug(message);
                    if (me.spinner) {
                        me.spinner.succeed();
                        me.spinner.text = message;
                        me.spinner.start();
                    }
                    me.binDirs.forEach(function (binDir) {
                        mkdirp.sync(binDir);
                        let binPath = path.join(binDir, wrappedBin.name);
                        let message = `- Creating ${chalk.green(binPath)}`;

                        if (fs.existsSync(binPath)) {
                            message = `- Binary ${chalk.green(binPath)} already exists, overwriting`;
                            if (!me.spinner) {
                                Logger.warn(message);
                            }
                        }

                        Logger.debug(message);
                        fs.writeFileSync(binPath, `#! /usr/bin/env node

require('mondorepo');
require('${wrappedBin.pkg.name}/${wrappedBin.file}');
`);
                        fs.chmodSync(binPath, '755');
                    });
                    if (me.spinner) {
                        me.spinner.succeed();
                    }
                });
                if (me.spinner) {
                    me.spinner.succeed();
                }
            }
            if (me.spinner) {
                me.spinner.succeed();
            }
        });
    }

    installRepo(repo) {
        let me = this;
        if (repo.installed) {
            return Promise.resolve(repo);
        }

        repo.installed = true;

        if (repo.exists()) {
            return me.installRepoPackages(repo);
        }

        let message = chalk.cyan(`Cloning repository '${chalk.magenta(repo.name)}' from '${chalk.yellow(repo.source.repository)}#${chalk.magenta(repo.source.branch)}' into '${chalk.magenta(repo.path)}'`);
        Logger.debug(message);
        if (me.spinner) {
            me.spinner.succeed();
            me.spinner.text = message;
            me.spinner.start();
        }

        return VCS.github.clone(repo.source.repository, repo.path, repo.source.branch).then(() => {
            fs.writeFile(path.join(repo.path, constants.child), JSON.stringify({root: path.relative(repo.path, process.cwd())}), function(err) {
                if (err) {
                    return me.raise(err);
                }
            });
            return me.installRepoPackages(repo);
        });
    }

    installChildren(repo) {
        let me = this;
        let uses;

        for (let child of repo.uses) {
            if (uses) {
                uses = uses.then(() => me.installRepo(child));
            } else {
                uses = me.installRepo(child);
            }
        }

        if (uses) {
            return uses.then(() => repo);
        }

        return Promise.resolve(repo);
    }

    installRepoPackages(repo) {
        let me = this;
        repo.open();

        let message = `Installing packages for '${chalk.yellow(repo.name)}'`;
        Logger.debug(message);
        if (!me.params.verbose) {
            if (me.spinner) {
                me.spinner.succeed();
            } else {
                me.spinner = ora();
            }
            me.spinner.text = message;
            me.spinner.start();
        }
        let install = me.packageManager().install(repo.path);
        me.binDirs.push(path.join(repo.path, 'node_modules', '.bin'));
        let packages = repo.packages;
        for (let pkg of packages) {
            install = install.then(() => {
                let message = `- Installing '${chalk.yellow(repo.name)}:${chalk.magenta(pkg.name)}'`;
                Logger.debug(message);
                if (me.spinner) {
                    me.spinner.succeed();
                    me.spinner.text= message;
                    me.spinner.start();
                }

                return me.packageManager().install(pkg.path).then(() => {
                    me.binDirs.push(path.join(pkg.path, 'node_modules', '.bin'));
                    let pkgJson = require(path.join(pkg.path, 'package.json'));
                    if (pkgJson.bin) {
                        Object.keys(pkgJson.bin).forEach(function (name) {
                            me.wrappedBins.push({
                                pkg: pkg,
                                name: name,
                                file: pkgJson.bin[name]
                            });
                        });
                    }
                });
            });
        }

        // read the repo from the disk
        return install.then(() => me.installChildren(repo));
    }

}

Install.define({
    help: {
        '': 'Brings the mondo in!',
        verbose: 'Provide additional output'
    },
    switches: '[verbose:boolean=false]'
});

module.exports = Install;
