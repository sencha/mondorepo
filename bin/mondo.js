#!/usr/bin/env node
const fs = require('fs');
const Path = require('path');
const chalk = require('chalk');

let cwd = Path.resolve('.');
let Mondo, mondoIndex;

while (cwd) {
    mondoIndex = Path.resolve(cwd, "node_modules/mondorepo/src/cli.js");
    if (fs.existsSync(mondoIndex)) {
        Mondo = require(mondoIndex);
        break;
    } else {
        let parentDir = Path.resolve(cwd, '..');

        if (parentDir === cwd) {
            cwd = null;
        } else {
            cwd = parentDir;
        }
    }
}

if (!Mondo) {
    Mondo = require('../src/cli.js');
}

const mondo = new Mondo();
mondo.run().then(function (){},
    function (cause) {
        console.log("");
        console.error(chalk.red(mondo.params.debug ? cause : cause.message));
        process.exit(1);
    }
);
