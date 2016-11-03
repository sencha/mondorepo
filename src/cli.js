"use strict";
const path = require('path');

const {Container, Help} = require('switchit');
const Version = require('./commands/Version');
const Install = require('./commands/Install');
const Run = require('./commands/Run');
const Logger = require('./utils/Logger');
const FileUtil = require('./utils/FileUtil');
const constants = require('./constants');

class Mondo extends Container {
    beforeExecute(params) {
        let me = this;
        super.beforeExecute(params);

        Logger.setThreshold(params.verbose ? 'debug' : (params.quiet ? 'warn' : 'info'));
        me.settingsPath = path.resolve(constants.home, constants.settings);
        let settings = {};
        if (FileUtil.exists(me.settingsPath)) {
            Logger.debug(`Loading settings file from ${me.settingsPath}`);
            settings = require(me.settingsPath);
        }
        me.settings = settings;
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
        help: Help,
        install: Install,
        run: Run,
        version: Version
    }
});

module.exports = Mondo;
