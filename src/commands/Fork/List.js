const Command = require('switchit').Command;
const columnify = require('columnify');
const chalk = require('chalk');

const Logger = require('../../utils/Logger');

class List extends Command {
    execute (params) {
        let me = this;
        let mondo = me.root();

        if (mondo.settings.forks && Object.keys(mondo.settings.forks).length) {
            Logger.info(`The following forks are configured in your settings file.`);
            Logger.info('');
            /*
             * The following block outputs a table-like layout with widths based on the
             * number of columns in the tty write stream (process.stdout)
             *
             * By default `columnify` prints column headers in uppercase without divider
             * but I'm not a fan of that, hence the `headingTransform` functions below.
             */
            console.log(
                columnify(
                    mondo.settings.forks,
                    {
                        columns: ['repo', 'fork'],
                        minWidth: (process.stdout.columns / 3),
                        maxLineWidth: 'auto',
                        config: {
                            repo: {
                                headingTransform: () => {
                                    return chalk.bold('Repository')+'\n···········';
                                },
                                maxWidth: (process.stdout.columns / 3)
                            },
                            fork: {
                                headingTransform: () => {
                                    return chalk.bold('Fork')+'\n·····';
                                },
                                maxWidth: (process.stdout.columns / 3)
                            }
                        }
                    }
                ).split('\n').map((l) => `  ${l}`).join('\n') // This indents the lines produced by `columnify`
            );
             Logger.info('');
             Logger.info(`Use ${chalk.bold.yellow('mondo fork (add|remove)')} to manage them.`);
        } else {
            Logger.info('There are no known forks in the global set');
        }
    }
}

List.define({
    help: 'Displays the global set of known forks'
});

module.exports = List;