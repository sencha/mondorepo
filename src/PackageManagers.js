const chalk = require('chalk');
const spawn = require('child_process').spawn;
const isWindows = /^win/.test(process.platform);

module.exports = {
    npm: {
        install(path) {
            return new Promise((resolve, reject) => {
                let process = spawn(`npm${isWindows ? '.cmd' : ''}`, ['install'], { cwd: path, stdio: 'inherit' });
                process.on('close', (code) => {
                    if (code) {
                        reject(`NPM install exited with code: ${code}`);
                    } else {
                        resolve();
                    }
                });

                process.on('error', reject);
            });
        }
    }
};
