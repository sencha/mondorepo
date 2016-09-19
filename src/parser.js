"use strict";
let path = require('path'),
    fs = require('fs'),
    logger = require('./logger'),
    deepExtend = require('deep-extend'),
    nameParser = require('./parsers/name-parser'),
    packageParser = require('./parsers/package-parser'),
    repoParser = require('./parsers/repo-parser'),
    constants = require('./constants'), cache = {};

function _parse(manifest, manifestDir) {
    let results = {
            main: manifest,
            mainDir: manifestDir,
            root: manifest,
            rootDir: manifestDir,
            manifests: {},
            packages: {},
            dependencies: {
                on: {},
                by: {}
            }
        },
        processed = [], queue = [{manifest, manifestDir}];

    function next() {
        let item = queue.shift();

        if (item) {
            let manifest = item.manifest,
                manifestDir = item.manifestDir,
                repoDir = path.resolve(manifestDir, manifest.install || constants.install),
                currentPackageNames, packages, packageNames, conflictingPackages;

            // If we already have done this file, move along
            if (processed.includes(manifest.name)) {
                logger.info(`already processed repo: ${manifest.name}, moving on`);
                return next();
            } else {
                logger.info(`processing repo: ${manifest.name}`);

                // Store the manifest for each repo, by name
                results.manifests[manifest.name] = manifest;

                // Extract Package Name from a repo (if it is a package also) to an alias
                // Extract Package names from any packages this Repo includes
                // Merge these together into an array of all packages this repo introduces
                packages = deepExtend(nameParser(manifest, manifestDir), packageParser(manifest, manifestDir));

                // Determine if there are any conflicting package names from other mono-repos
                packageNames = Object.keys(packages);
                currentPackageNames = Object.keys(results.packages);
                conflictingPackages = new Set([...currentPackageNames].filter(packageName => packageNames.includes(packageName)));
                if (conflictingPackages.size) {
                    logger.error(`Repo: ${manifest.name} contains conflicting package names: ${[...conflictingPackages]}`);
                }

                // Add to the list of all packages
                deepExtend(results.packages, packages);

                // We only need to deal with repo processing if the manifest has a uses block
                if (manifest.uses) {
                    let childFile = path.resolve(manifestDir, constants.child),
                        repoAliases, isChild, rootManifestExists, childData;

                    // Is this a child mondo-repo
                    // If so change the rootManifestDirectory to point to the parent that created this project
                    try {
                        fs.accessSync(childFile, fs.R_OK);
                        isChild = true;
                    } catch (e) {
                        isChild = false;
                    }

                    // If this is a child repo we need to find the root repo to determine where mondo-repos are stored
                    if (isChild) {
                        childData = require(childFile);

                        if (childData && childData.root) {
                            let rootManifestDir = path.resolve(manifestDir, childData.root),
                                rootManifestFile = path.resolve(rootManifestDir, constants.manifest);

                            // Determine if there is a parent manifest file where this child thinks one should be
                            try {
                                fs.accessSync(rootManifestFile, fs.R_OK);
                                rootManifestExists = true;
                            } catch (e) {
                                rootManifestExists = false;
                            }

                            // If there is a manifest found in the project root
                            if (rootManifestExists) {
                                let rootManifestData = require(rootManifestFile);
                                if (rootManifestData) {

                                    // If this is the main manifest file (the file that began the parsing) and it is a child
                                    // store the project root manifest for later
                                    if (manifest.name == results.main.name) {
                                        logger.info(`Repo: ${manifest.name} is the main manifest but also a child mondorepo. Setting root to ${rootManifestDir}`);
                                        results.root = rootManifestData;
                                        results.rootDir = rootManifestDir;
                                    }
                                    repoDir = path.resolve(rootManifestDir, rootManifestData.install || constants.install);
                                }
                            } else {
                                logger.error(`Unable to find manifest at ${rootManifestFile} requested by repo: ${manifest.name}`);
                            }
                        } else {
                            // child file exists, but no root, this is likely bad
                            logger.error(`Child file for repo: ${manifest.name} exists but no root is set`);
                        }
                    }

                    // Extract Manifest Repos to aliases
                    repoAliases = repoParser(manifest, manifestDir, repoDir);
                    if (repoAliases) {

                        let repoKeys = Object.keys(repoAliases);

                        // Create an object to look up all repos that the repo 'manifest.name' depends on
                        if (!results.dependencies.on[manifest.name]) {
                            results.dependencies.on[manifest.name] = {};
                        }

                        // Store a reference to all immediate dependencies for repo 'manifest.name'
                        for(let repoKey of repoKeys) {
                            results.dependencies.on[manifest.name][repoKey] = {
                                dependee: manifest.name,
                                path: repoAliases[repoKey]
                            };
                        }

                        for (let repoName of repoKeys) {
                            let repoManifestDir = repoAliases[repoName],
                                repoManifestFile = path.resolve(repoManifestDir, constants.manifest), repoHasManifest;

                            // Keep a list of all repos that are depended on by 'repoName'
                            if (!results.dependencies.by[repoName]) {
                                results.dependencies.by[repoName] = {};
                            }

                            results.dependencies.by[repoName][manifest.name] = {
                                dependee: manifest.name,
                                path: manifestDir
                            };

                            if(results.dependencies.on[repoName] && results.dependencies.on[repoName][manifest.name]) {
                                logger.warn(`Circular dependency found between repo: ${repoName} and repo: ${manifest.name}`);
                            }

                            try {
                                fs.accessSync(repoManifestFile, fs.R_OK);
                                repoHasManifest = true;
                            } catch (e) {
                                repoHasManifest = false;
                            }

                            if (repoHasManifest) {
                                let repoManifest = require(repoManifestFile);
                                queue.push({manifest: repoManifest, manifestDir: repoManifestDir});
                            } else {
                                logger.error(`Repo dependency error in repo: ${manifest.name}. Unable to find manifest at ${repoManifestFile}`);
                            }
                        }
                    }
                }

                let dependedRepos = results.dependencies.on[manifest.name],
                    dependedRepoNames = Object.keys(dependedRepos || {}),
                    dependentRepos = results.dependencies.by[manifest.name],
                    dependentRepoNames = Object.keys(dependentRepos || {});

                if(dependedRepos) {
                    for (let repo of dependentRepoNames) {
                        if (!results.dependencies.on[repo]) {
                            results.dependencies.on[repo] = {};
                        }

                        for (let a of dependedRepoNames) {
                            results.dependencies.on[repo][a] = {
                                dependee: manifest.name,
                                path: dependedRepos[a].path
                            };
                        }
                    }
                }

                processed.push(manifest.name);
                return next();
            }
        } else {
            return results;
        }
    }

    logger.info(`Starting Mondo parse of repo: ${manifest.name} @ ${manifestDir}`);
    cache[manifest.name] = next();
    return cache[manifest.name];
}

module.exports = {
    getResults: (repoName) => {
        return cache[repoName];
    },
    parse: _parse
};
