"use strict";
const Path = require('path');
const fs = require('fs');
const {Command} = require('switchit');
const semver = require('semver');
const chalk = require('chalk');
const columnify = require('columnify');
const jsonfile = require('jsonfile');
const JSON5 = require('json5');
const NPM = require('../pkgMgrs/Npm.js');
const Repo = require('../Repo.js');
const Collection = require('../utils/Collection.js');
const isWindows = /^win/.test(process.platform);

class Publish extends Command {
    constructor() {
        this.publisher = new NPM();
    }

    execute(params) {
        const {recursive, dry, script, 'check-existing': checkExisting} = params;
        const path = params.path ? Path.isAbsolute(params.path) ? params.path : Path.join(process.cwd(), params.path) : process.cwd();
        const repo = Repo.open(path);

        this._packages = new Collection();

        this.hasPublishConflict = false;
        this.dry = script ? false : dry;
        this.script = script;
        this.checkExisting = checkExisting;

        // Get a list of all the packages we will be publishing
        for (let pkg of (recursive ? repo.allPackages : repo.packages)) {
            if (!pkg.private) {
                this._packages.add(pkg);
            }
        }

        if (checkExisting) {
            return this.doCheckExisting()
                .then(() => {
                    if (this.dry || this.hasPublishConflict) {
                        this.log();
                    } else if (script) {
                        this.writeScript();
                    } else {
                        this.log();
                        return this.publish();
                    }
                });
        } else {
            if (script) {
                this.writeScript();
            } else {
                this.log();
                return this.publish();
            }
        }
    }

    doCheckExisting() {
        return Promise.all(
            this._packages.map(pkg => {
                // Run NPM view over the package to get registry data
                return this.publisher.view(pkg.name, pkg.version)
                    .then(results => {
                        const registry = pkg.$$registry = !!results ? JSON5.parse(results) : false;

                        // Check if the version we would like to rev to is already published for this package
                        if (registry) {
                            pkg.$$alreadyPublished = true;
                        } else {
                            pkg.$$alreadyPublished = false;
                        }


                        // Check if there is a fingerprint match for the package
                        const mondo = registry.mondo || {};
                        if (pkg.hash === mondo.hash) {
                            pkg.$$hashMatch = true;
                        }

                        if (pkg.$$alreadyPublished && !pkg.$$hashMatch) {
                            this.hasPublishConflict = true;
                        }

                    }).catch(() => {
                        pkg.$$neverPublished = true;
                        //catch here though so the promise.all doesn't fail
                    });
            }));
    }

    log() {
        let columns = Array.from(this._packages.items);
        let statusRegExp = /^ (W|E) /g;
        let statusRegExpResult, colorFunc;

        columns.map(column => {
            if (column.$$alreadyPublished && !column.$$hashMatch) {
                column.status = 'E';
                column.details = `This version is already published to the NPM Registry is locally modified`;
            } else if (column.$$alreadyPublished === false) {
                column.details = `OK`;
            } else if (column.$$neverPublished) {
                column.details = `OK (first publish)`;
            } else {
                column.details = `Unknown published status`;
            }
        });

        columns = columnify(columns, {
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

    publish() {
        // Shortcut to chain then's of promises from an array
        return this._packages.reduce((promise, pkg) => {
            return promise.then(() => {
                const json = pkg.publishify();
                const original = fs.readFileSync(pkg.file);
                jsonfile.writeFileSync(pkg.file, json, {spaces: 4});

                return this.publisher.publish(pkg.path).then(r => {
                    fs.writeFileSync(pkg.file, original);
                    return r;
                }).catch(err => {
                    fs.writeFileSync(pkg.file, original);
                    if (this.checkExisting || !err.message.includes('You cannot publish over the previously published version')) {
                        throw err;
                    } else {
                        return this.publisher.view(pkg.name, pkg.version).then(results => {
                            const registry = !!results ? JSON5.parse(results) : false;

                            const mondo = registry.mondo || {};
                            if (pkg.hash !== mondo.hash) {
                                throw new Error(`${pkg.name} at version ${pkg.version} is already published to NPM and has changed locally.`);
                            }
                            // No entry for this package in the NPM registry
                        });
                    }
                });
            });
        }, Promise.resolve());
    }

    writeScript() {
        const prefix = isWindows ? 'REM' : '#';
        this._packages.forEach(pkg => {
            if (!pkg.$$alreadyPublished) {
                console.log(`npm publish ${pkg.path}`);
            } else {
                console.log(`${prefix} Version already exists for ${pkg.name}`);
                console.log(`${prefix} npm publish ${pkg.path}`);
            }
        });
    }
}

Publish.define({
    help: {
        '': 'Rev version of packages from the current repo'
    },
    parameters: '[path=]',
    switches: `[dry:boolean=false]
 [script:boolean=false]
 [check-existing:boolean=true]
 [recursive:boolean=false]`
});


module.exports = Publish;
