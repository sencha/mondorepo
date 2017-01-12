"use strict";

const Path = require('path');
const {Command} = require('switchit');
const semver = require('semver');
const chalk = require('chalk');
const columnify = require('columnify');
const JSON5 = require('json5');
const jsonfile = require('jsonfile');
const NPM = require('../pkgMgrs/Npm.js');
const Repo = require('../Repo.js');
const Collection = require('../utils/Collection.js');

class RevPackage {
    constructor(pkg) {
        this._pkg = pkg;
        this._originalVersion = semver(this._pkg.version.raw);
        this._version = semver(this._pkg.version.raw);

        this.registry = false;
        this.alreadyPublished = false;
        this.globalVersionMatch = false;
        this.hashMatch = false;
        this._publishableDependencies = [];
    }

    set version(value) {
        this._version = value;
    }

    get version() {
        return this._version;
    }

    get originalVersion() {
        return this._originalVersion;
    }

    get hash() {
        return this._pkg.hash;
    }

    get originalVersion() {
        return this._originalVersion;
    }

    get package() {
        return this._pkg;
    }

    get name() {
        return this._pkg.name;
    }

    get shouldPublish() {
        return !this.hashMatch || this.hasDependencyOnPublishable;
    }

    get willErrorIfPublished() {
        return this.alreadyPublished;
    }

    get publishableDependencies() {
        return this._publishableDependencies;
    }

    get hasDependencyOnPublishable() {
        return this._publishableDependencies.length > 0;
    }

    addPublishableDependency(pkg) {
        if (!this._publishableDependencies.includes(pkg)) {
            this._publishableDependencies.unshift(pkg);
        }
    }
}


class Rev extends Command {
    execute(params) {
        const path = params.path ? Path.isAbsolute(params.path) ? params.path : Path.join(process.cwd(), params.path) : process.cwd();
        const version = params.version.raw !== '0.0.0' ? params.version : false;
        const {preid, increment, recursive, dry, modified: checkModified, 'check-existing': checkExisting} = params;
        const repo = Repo.open(path);

        this._revPackages = new Collection();
        this.checkModified = checkModified;
        this.checkExisting = checkExisting;
        this.dry = dry;

        // Get a list of all the this._revPackages we will be reving

        for (let pkg of (recursive ? repo.allPackages : repo.packages)) {
            this._revPackages.add(new RevPackage(pkg));
        }

        // Increment or set the version for this package in memory
        for (let revPkg of this._revPackages) {
            if (version) {
                if (semver.neq(revPkg.version, version)) {
                    revPkg.version = version;
                } else {
                    revPkg.globalVersionMatch = true;
                }
            } else {
                revPkg.version = semver(semver.inc(revPkg.version, increment, preid));
            }
        }

        return this.updateRegistryData()
            .then(this.updatePublishableDependencies.bind(this))
            .then(this.logRev.bind(this))
            .then(this.writeRev.bind(this));
    }

    updateRegistryData() {
        const checkExisting = this.checkExisting;
        const checkModified = this.checkModified;

        if (checkExisting || checkModified) {
            const npm = new NPM();
            return Promise.all(
                this._revPackages.map(revPkg => {
                    // Run NPM view over the package to get registry data
                    return npm.view(revPkg.name, revPkg.originalVersion)
                        .then(results => {
                            const registry = revPkg.registry = !!results ? JSON5.parse(results) : false;

                            // Check if the version we would like to rev to is already published for this package
                            if (registry) {
                                for (let version of registry.versions) {
                                    if (semver.eq(revPkg.version, version)) {
                                        revPkg.alreadyPublished = true;
                                    }
                                }
                            }

                            // Check if there is a fingerprint match for the package
                            if (checkModified) {
                                const mondo = registry.mondo || {};
                                if (revPkg.hash === mondo.hash) {
                                    revPkg.hashMatch = true;
                                }
                            }

                            // No entry for this package in the NPM registry
                        }).catch(() => {
                            //catch here though so the promise.all doesn't fail
                        });
                }));
        }

        return Promise.resolve();

    }

    updatePublishableDependencies() {
        const me = this;
        const _updateDependent = function(pkg) {
            pkg.allMondoDependencies.forEach(mondoPkg => {
                const revPackage = me._revPackages.get(pkg.name);
                const childRevPkg = me._revPackages.get(mondoPkg.name);

                if (childRevPkg && revPackage && childRevPkg.shouldPublish) {
                    revPackage.addPublishableDependency(mondoPkg);
                    _updateDependent(mondoPkg);
                }
            });
        };

        me._revPackages.forEach(revPkg => {
            _updateDependent(revPkg.package);
        });
    }

    logRev() {
        const log = [];

        let statusRegExp = /^ (W|E) /g;
        let columns, statusRegExpResult, colorFunc;

        this._revPackages.forEach(revPackage => {
            const pkgLog = {
                name: revPackage.name,
                version: `${revPackage.version} (was ${revPackage.originalVersion})`,
            };
            let details = [];

            if ((this.checkExisting || this.checkModified) && revPackage.alreadyPublished) {
                pkgLog.status = 'W';
                details = [`${revPackage.version} is already published`];
            }else if (revPackage.globalVersionMatch) {
                pkgLog.status = 'W';
                details = [`${revPackage.version} is current package version`];
            } else {
                if (!this.checkModified) {
                    details.push('assumed changed');
                } else if (!revPackage.hashMatch) {
                    details.push('content changed');
                }

                if (revPackage.hasDependencyOnPublishable) {
                    const pkg = revPackage.publishableDependencies[0];
                    const numPkgs = revPackage.publishableDependencies.length;
                    details.push(`dependency change: ${pkg.name}${numPkgs > 1 ? ` and ${numPkgs - 1} other${numPkgs > 2 ? 's' : ''}` : ''}`);
                }
            }

            pkgLog.details = `(${details.join('; ')})`;

            log.push(pkgLog);
        });

        columns = columnify(log, {
            showHeaders: false,
            minWidth: 20,
            config: {
                status: {align: 'center', minWidth: 3}
            },
            columns: ['status', 'name', 'version', 'details']
        });

        // Color any Warnings or Errors
        columns = columns.split('\n')
            .map(row => {
                statusRegExpResult = statusRegExp.exec(row);
                if (statusRegExpResult) {
                    colorFunc = statusRegExpResult[1] === 'W' ? chalk.yellow : chalk.red;
                    return colorFunc(row);
                }
                return row;
            }).join('\n');

        console.log(columns);
    }

    writeRev() {
        if (!this.dry) {
            this._revPackages.forEach(revPkg => {
                if (revPkg.shouldPublish) {
                    // Get the package manifest of a package :/
                    const pkg = revPkg.package;
                    const manifest = pkg.package;
                    manifest.version = revPkg.version.raw;
                    jsonfile.writeFileSync(Path.join(pkg.path, 'package.json'), manifest, {spaces: 4});
                }
            });
        }
    }
}

Rev.define({
    help: {
        '': 'Rev version of packages from the current repo',
        'dry': 'Dry run, will not modify any files'
    },
    parameters: '[path=]',
    switches: `[dry:boolean=false]
    [check-existing:boolean=true]
    [modified:boolean=false]
    
    [force-patch-version-sync:boolean=false]
    [recursive:boolean=false]
    [increment:string=patch]
    [preid:string=]
    [version:semver=0.0.0]`
});

module.exports = Rev;
