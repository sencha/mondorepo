const os = require('os');
const Path = require('path');
const chalk = require('chalk');
const SimpleGit = require('simple-git');
const FileUtil = require('./utils/FileUtil');
const constants = require('./constants');
const settingsPath = Path.resolve(constants.home, constants.settings);
let forks = {};
if (FileUtil.exists(settingsPath)) {
    const settings = require(settingsPath);
    forks = settings.forks;
}

module.exports = {
    github: {
        clone(repoPath, path, branch = "master") {
            return new Promise((resolve, reject) => {
                const fork = forks[repoPath];
                const originalRepoPath = repoPath;

                if (fork) {
                    repoPath = fork;
                    Logger.info(`Fork Detected installing from '${chalk.yellow(repoPath)}#${chalk.magenta(branch)}' into '${path}'`);
                }

                // SimpleGit().clone(`git@github.com:${repoPath}.git`, path, ['-b', branch, '--depth', '1', '--no-single-branch'], (err) => {
                SimpleGit().clone(`git@github.com:${repoPath}.git`, path, ['-b', branch], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (fork) {
                            SimpleGit(path).addRemote(constants.forkedRepoName, `git@github.com:${originalRepoPath}.git`, (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        } else {
                            resolve();
                        }
                    }
                });
            });
        }
    }
};
