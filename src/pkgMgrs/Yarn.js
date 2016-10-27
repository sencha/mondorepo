const chalk = require('chalk');
const path = require('path');
const spawn = require('child_process').spawn;

const PackageManager = require('./Base');
const Logger = require('../utils/Logger');

const isWindows = /^win/.test(process.platform);

class Yarn extends PackageManager {
    spawn (args, options) {
        let me = this;
        return new Promise((resolve, reject) => {
            let process = spawn(`${path.resolve(__dirname, "../../node_modules/.bin/yarn")}${isWindows ? '.cmd' : ''}`, args, options);

            let result = '';
            if (!me.debug) {
                process.stdout.on('data', function (data) {
                    result += data.toString();
                });
            }

            process.on('close', (code) => {
                if (code) {
                    reject(`Yarn install exited with code: ${code}`);
                } else {
                    Logger.debug(result.trim());
                    resolve();
                }
            });

            process.on('error', reject);
        });
    }

    install (path) {
        let me = this;
        let args = ['install'];
        let opts = { cwd: path };
        if (me.debug) {
            opts['stdio'] = 'inherit';
        }
        return me.spawn(args, opts);
    }
}

module.exports = Yarn;