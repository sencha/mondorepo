"use strict";
const {Command} = require('switchit');
const spawn = require('child_process').spawn;
const Path = require('path');

class Run extends Command {
    beforeExecute (params) {
        super.beforeExecute(params);
        params.debug = this.root().debug;
    }

    execute(params) {
        const file = params.file;

        if (params.debug) {
            let args = ['--require', `${Path.resolve(__dirname, '..', 'Init.js')}`, file];
            let devtool = spawn('devtool', args);

            devtool.stdout.pipe(process.stdout);
            devtool.stderr.pipe(process.stderr);
            devtool.on('close', (code) => {
                process.exit(code);
            });
        } else {
            require(Path.resolve(__dirname, '..', 'Init'));
            require(Path.resolve(process.cwd(), file));
        }
    }
}

Run.define({
    help: {
        '': 'Runs a file using `devtool`',
        'file': 'The file to run'
    },
    parameters: '[file=]'
});


module.exports = Run;

// TODO: Add all params for devtool
/*
 --watch, -w             enable file watching (for development)
 --quit, -q              quit application on fatal errors
 --console, -c           redirect console logs to terminal
 --index, -i             specify a different index.html file
 --poll, -p              enable polling when --watch is given
 --show, -s              show the browser window (default false)
 --headless, -h          do not open the DevTools window
 --timeout, -t           if specified, will close after X seconds
 --break                 insert a breakpoint in entry point
 --config                a path to .devtoolrc config file
 --verbose               verbose Chromium logging
 --version, -v           log versions of underlying tools
 --require, -r           require path(s) before running entry
 --browser-field, --bf   resolve using "browser" field
 --no-source-maps,
 --no-sm   disable source map generation
 --no-node-timers,
 --no-nt   use browser timers
 --no-browser-globals,
 --no-bg   removes window,document,navigator from required files
 */
