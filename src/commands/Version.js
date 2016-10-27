const chalk = require('chalk');
const {Command} = require('switchit');
const jsonfile = require('jsonfile');
const Path = require('path');
const Logger = require('../utils/Logger');

class Version extends Command {
    execute() {
        let pkg = jsonfile.readFileSync(Path.resolve(__dirname, '..', '..', 'package.json'));
        let version = (pkg && pkg.version) || 'unknown';
        Logger.log(`Mondo Version: ${chalk.green(version)}`);
    }
}

Version.define({
    help: 'Displays the current version'
});

module.exports = Version;
