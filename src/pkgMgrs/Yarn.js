const chalk = require('chalk');
const path = require('path');
const spawn = require('child_process').spawn;
const exec = require('child_process').execSync;

const PackageManager = require('./Base');
const Logger = require('../utils/Logger');

const isWindows = /^win/.test(process.platform);

class Yarn extends PackageManager {
    spawn(args, options) {
        return new Promise((resolve, reject) => {
            let process = spawn(`yarn${isWindows ? '.cmd' : ''}`, args, options);

            let result = '';
            if (!Logger.debug.enabled) {
                process.stdout.on('data', function(data) {
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

    install(path) {
        let me = this;
        let args = ['install'];
        let opts = {cwd: path};
        if (Logger.debug.enabled) {
            opts['stdio'] = 'inherit';
        }
        return me.spawn(args, opts);
    }

    available() {
        try {
            exec('yarn --version');
            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = Yarn;
