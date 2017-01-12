"use strict";
const Path = require('path');

const JSON5 = require('json5');

const {Container, commands} = require('switchit');
const Install = require('./commands/Install');
const Exec = require('./commands/Exec');
const Fork = require('./commands/Fork');
const Publish = require('./commands/Publish');
const Rev = require('./commands/Rev');
const Logger = require('./utils/Logger');
const FileUtil = require('./utils/FileUtil');
const constants = require('./constants');
const Util = require('./Util');

const defaultSettings = {
    forks: {
        //
    }
};

if (commands.Version) {
    commands.Version.home = Path.resolve(__dirname, '..');
}

class Mondo extends Container {
    beforeExecute(params) {
        super.beforeExecute(params);

        let me = this;

        Logger.setThreshold(params.verbose ? 'debug' : (params.quiet ? 'warn' : 'info'));

        me.settingsPath = Path.resolve(constants.home, constants.settings);

        let settings;

        if (FileUtil.exists(me.settingsPath)) {
            Logger.debug(`Loading settings file from ${me.settingsPath}`);
            settings = JSON5.parse(FileUtil.getFileContents(me.settingsPath));
        }

        me.settings = Util.merge(Util.merge({}, defaultSettings), settings);
    }
}

Mondo.define({
    help: {
        '': 'Management for collections of packages across teams',
        quiet: 'Provide less logging output (remove info)',
        verbose: 'Provide verbose logging output'
    },
    switches: '[quiet:boolean=false] [verbose:boolean=false]',
    commands: {
        help: commands.Help,
        install: Install,
        exec: Exec,
        rev: Rev,
        publish: Publish,
        version: commands.Version,
        fork: Fork
    }
});

module.exports = Mondo;
