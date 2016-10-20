const {Command} = require('switchit');
const jsonfile = require('jsonfile');
const Path = require('path');

class Version extends Command {
    execute() {
        let pkg = jsonfile.readFileSync(Path.resolve(__dirname, '..', '..', 'package.json'));
        let version = (pkg && pkg.version) || 'unknown';
        console.log(`Mondo Version: ${version}`);
    }
}

module.exports = Version;
