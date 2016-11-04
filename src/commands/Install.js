"use strict";
const fs = require('fs');
const Path = require('path');

const chalk = require('chalk');
const {Command} = require('switchit');
const ora = require('ora');

const constants = require('../constants');
const Repo = require('../Repo');
const VCS = require('../VCS');
const PackageManagers = require('../PackageManagers');
const Logger = require('../utils/Logger');
const FileUtil = require('../utils/FileUtil');

const isWindows = /^win/.test(process.platform);

class Install extends Command {
    execute() {
        let me = this;
        let mondo = this.root();

        me.binDirs = [];
        me.wrappedBins = [];

        me.vcs = VCS.git({
            forks: mondo.settings.forks || {}
        });

        if (!me.vcs.available()) {
            throw new Error('Git is required to run `mondo install`');
        }

        me.packageManager = (PackageManagers[mondo.settings.packageManager] || PackageManagers.yarn)();

        // Fallback to NPM when any package manager is not available
        if (!me.packageManager.available()) {
            Logger.debug('Global yarn not found, using npm instead.');
            me.packageManager = PackageManagers.npm();
        }

        const repo = Repo.open(process.cwd());
        return me.installRepo(repo.root).then(() => {
            if (me.wrappedBins.length > 0) {
                let message = 'Linking local binaries';
                Logger.debug(message);
                if (me.spinner) {
                    me.spinner.succeed();
                    me.spinner.text = message;
                    me.spinner.start();
                }

                let createWinBinary = (binDir, wrappedBin) => {
                    let binPath = Path.join(binDir, wrappedBin.name + '.cmd');
                    let message = `- Creating ${chalk.green(binPath)}`;

                    if (fs.existsSync(binPath)) {
                        message = `- Binary ${chalk.green(binPath)} already exists, overwriting`;
                        if (!me.spinner) {
                            Logger.warn(message);
                        }
                    }

                    Logger.debug(message);
                    fs.writeFileSync(binPath, `@IF EXIST "%~dp0\\node.exe" (\n  "%~dp0\\node.exe"  "%~dp0\\${wrappedBin.name}" %*\n) ELSE (\n  @SETLOCAL\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\n  node  "%~dp0\\${wrappedBin.name}" %*\n)\n`);
                    fs.chmodSync(binPath, '755');
                };

                let createUnixBinary = (binDir, wrappedBin) => {
                    let binPath = Path.join(binDir, wrappedBin.name);
                    let message = `- Creating ${chalk.green(binPath)}`;

                    if (fs.existsSync(binPath)) {
                        message = `- Binary ${chalk.green(binPath)} already exists, overwriting`;
                        if (!me.spinner) {
                            Logger.warn(message);
                        }
                    }

                    Logger.debug(message);
                    fs.writeFileSync(binPath, `#! /usr/bin/env node\nrequire('mondorepo/src/init');\nrequire('${wrappedBin.pkg.name}/${wrappedBin.file}');\n`);
                    fs.chmodSync(binPath, '755');
                };

                me.wrappedBins.forEach(function(wrappedBin) {
                    let message = `- Linking '${chalk.green(wrappedBin.name)}'`;
                    Logger.debug(message);
                    if (me.spinner) {
                        me.spinner.succeed();
                        me.spinner.text = message;
                        me.spinner.start();
                    }
                    me.binDirs.forEach(function(binDir) {
                        if (!fs.existsSync(binDir)) {
                            FileUtil.mkdirp(binDir);
                        }
                        createUnixBinary(binDir, wrappedBin);
                        if (isWindows) {
                            createWinBinary(binDir, wrappedBin);
                        }
                    });
                });
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
            if (repo.isRoot) {
                const childPath = Path.resolve(repo.path, constants.child);
                fs.writeFileSync(childPath, JSON.stringify({root: true}));
            }

            return me.installRepoPackages(repo);
        }

        let message = chalk.cyan(`Cloning repository '${chalk.magenta(repo.name)}' from '${chalk.yellow(repo.source.repository)}#${chalk.magenta(repo.source.branch || constants.branch)}' into '${chalk.magenta(Path.relative(process.cwd(), repo.path))}'`);
        Logger.debug(message);
        if (me.spinner) {
            me.spinner.succeed();
            me.spinner.text = message;
            me.spinner.start();
        }



        return me.vcs.clone(repo.source.repository, repo.path, repo.source.branch).then(() => {
            fs.writeFileSync(Path.join(repo.path, constants.child), JSON.stringify({root: Path.relative(repo.path, process.cwd())}));
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
        if (!Logger.debug.enabled) {
            if (me.spinner) {
                me.spinner.succeed();
            } else {
                me.spinner = ora();
            }
            me.spinner.text = message;
            me.spinner.start();
        }
        let install = me.packageManager.install(repo.path);
        me.binDirs.push(Path.join(repo.path, 'node_modules', '.bin'));
        let packages = repo.packages;
        for (let pkg of packages) {
            install = install.then(() => {
                let message = `- Installing '${chalk.yellow(repo.name)}:${chalk.magenta(pkg.name)}'`;
                Logger.debug(message);
                if (me.spinner) {
                    me.spinner.succeed();
                    me.spinner.text = message;
                    me.spinner.start();
                }

                return me.packageManager.install(pkg.path).then(() => {
                    me.binDirs.push(Path.join(pkg.path, 'node_modules', '.bin'));
                    let pkgJson = require(Path.join(pkg.path, 'package.json'));
                    if (pkgJson.bin) {
                        Object.keys(pkgJson.bin).forEach(function(name) {
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
        '': 'Brings the mondo in!'
    }
});

module.exports = Install;
