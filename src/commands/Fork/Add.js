const Command = require('switchit').Command;
const chalk = require('chalk');

const Logger = require('../../utils/Logger');
const FileUtils = require('../../utils/FileUtil');

class Add extends Command {
    execute (params) {
        let me = this;
        let mondo = me.root();

        let forks = mondo.settings.forks;

        let replace = false;
        if (forks[params.repoName]) {
            if (params.force) {
                replace = true;
                Logger.warn(`Replaced ${chalk.bold.yellow(forks[params.repoName])} with ${chalk.bold.yellow(params.forkName)} as fork for ${chalk.bold.yellow(params.repoName)}.`)
            } else {
                Logger.error(`${chalk.bold.yellow(forks[params.repoName])} is already configured as fork for ${chalk.bold.yellow(params.repoName)}.`);
                if (forks[params.repoName] !== params.forkName) {
                    Logger.info('');
                    Logger.info(`Use ${chalk.bold.yellow('--force')} to overwrite it.`);
                }
                return;
            }
        }

        forks[params.repoName] = params.forkName;
        FileUtils.writeFile(mondo.settingsPath, JSON.stringify(mondo.settings, null, '  '));
        if (!replace) {
            Logger.info(`Added ${chalk.bold.yellow(params.forkName)} as known fork for ${chalk.bold.yellow(params.repoName)}.`);
        }
    }
}

Add.define({
    help: {
        '': 'Sets the fork to use for a given repository',
        repoName: 'The name of the repository',
        forkName: 'The fork to use (when referring to that repository)',
        force: 'Overwrite existing values'
    },
    switches: '[force:boolean=false]',
    parameters: '{repoName} {forkName}'
});

module.exports = Add;