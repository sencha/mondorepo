"use strict";
const path = require('path');

const {Container, Help} = require('switchit');
const Version = require('./commands/Version');
const Install = require('./commands/Install');
const Run = require('./commands/Run');
const Logger = require('./utils/Logger');
const FileUtil = require('./utils/FileUtil');
const constants = require('./constants')

class Mondo extends Container {
    constructor () {
        super();

    }

    beforeExecute (params) {
        let me = this;
        super.beforeExecute(params);
        me.debug = params.debug;
        Logger.setThreshold(me.debug ? 'debug' : 'info');
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
        debug: 'Enable debug mode (additional logging)'
    },
    switches: '[debug:boolean=false]',
    commands: {
        help: Help,
        install: Install,
        run: Run,
        version: Version
    }
});

module.exports = Mondo;
