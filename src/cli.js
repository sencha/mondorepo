"use strict";
const {Container, Help} = require('switchit');
const Version = require('./commands/Version');
const Install = require('./commands/Install');
const Run = require('./commands/Run');

class Mondo extends Container { }

Mondo.define({
    commands: {
        help: Help,
        install: Install,
        run: Run,
        version: Version
    }
});

module.exports = Mondo;
