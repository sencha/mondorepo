const chalk = require('chalk');
const spawn = require('child_process').spawn;

const PackageManager = require('./Base');
const Logger = require('../utils/Logger');

const isWindows = /^win/.test(process.platform);

class Npm extends PackageManager {
    spawn (args, options) {
        let me = this;
        return new Promise((resolve, reject) => {
            if (!me.debug) {
                spawn(`npm${isWindows ? '.cmd' : ''}`, ['set', 'progress=false'], options);
            }
            let process = spawn(`npm${isWindows ? '.cmd' : ''}`, args, options);

            let result = '';
            if (!me.debug) {
                process.stdout.on('data', function (data) {
                    result += data.toString();
                });
            }

            process.on('close', (code) => {
                if (code) {
                    reject(`NPM install exited with code: ${code}`);
                } else {
                    Logger.debug(result.trim());
                    if (!me.debug) {
                        spawn(`npm${isWindows ? '.cmd' : ''}`, ['set', 'progress=true'], options);
                    }
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
        } else {
            args.push('--depth');
            args.push('0');
        }
        return me.spawn(args, opts);
    }
}

module.exports = Npm;