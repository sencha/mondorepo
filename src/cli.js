"use strict";
const {Container, Help} = require('switchit');
const Version = require('./commands/Version');
const Install = require('./commands/Install');
const Run = require('./commands/Run');
const Logger = require('./utils/Logger');

class Mondo extends Container {
    beforeExecute (params) {
        super.beforeExecute(params);
        this.debug = params.debug;
        Logger.setThreshold(this.debug ? 'debug' : 'info');
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
