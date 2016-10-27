#!/usr/bin/env node
const fs = require('fs'),
      path = require('path');

var cwd = path.resolve('.'),
    Mondo,
    mondoIndex;

while (cwd && cwd !== '/') {
    mondoIndex = path.resolve(cwd, "node_modules/mondorepo/src/cli.js");
    if (fs.existsSync(mondoIndex)) {
        Mondo = require(mondoIndex);
        break;
    }
    cwd = path.dirname(cwd);
}

if (!Mondo) {
    Mondo = require('../src/cli.js');
}

const mondo = new Mondo();
mondo.run().then(function (){},
    function (cause) {
        console.error(mondo.params.debug ? cause : cause.message);
        process.exit(1);
    }
);
