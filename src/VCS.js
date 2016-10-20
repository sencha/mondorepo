const simpleGit = require('simple-git')();

module.exports = {
    github: {
        clone(repoPath, path, branch = "master") {
            return new Promise((resolve, reject) => {
                simpleGit.clone(`git@github.com:${repoPath}`, path, ['-b', branch, '--single-branch'], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }
};
