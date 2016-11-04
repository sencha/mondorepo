const Command = require('switchit').Command;
const chalk = require('chalk');

const Logger = require('../../utils/Logger');
const FileUtils = require('../../utils/FileUtil');

class Remove extends Command {
    execute (params) {
        let me = this;
        let mondo = me.root();

        let forks = mondo.settings.forks;

        if (!forks[params.repoName]) {
            Logger.info(`There is no known fork for ${chalk.bold.yellow(params.repoName)}.`);
            return;
        }

        let old = forks[params.repoName];
        delete forks[params.repoName];
        FileUtils.writeFile(mondo.settingsPath, JSON.stringify(mondo.settings, null, '  '));
        Logger.info(`Removed ${chalk.bold.yellow(old)} as known fork for ${chalk.bold.yellow(params.repoName)}.`);
    }
}

Remove.define({
    help: {
        '': 'Removes the known fork for a repository',
        repoName: 'The name of the repository'
    },
    parameters: '{repoName}'
});

module.exports = Remove;