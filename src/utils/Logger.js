const chalk = require('chalk');

const levels = ['error', 'warn', 'info', 'debug'];
//const colors = ['red', 'yellow', 'blue', 'black'];

class Logger {
    static mute () {
        Logger._oldthreshold = Logger._threshold;
        Logger._threshold = -1;
        Logger._muted = true;
    }

    static setThreshold (threshold = 0) {
        if (threshold instanceof String || typeof threshold == 'string') {
            threshold = threshold.trim().toLowerCase();
            threshold = levels.indexOf(threshold);
        }
        if (isNaN(parseFloat(threshold)) || !isFinite(threshold) || threshold < 0) {
            threshold = 0;
        }
        Logger._threshold = threshold;
    }

    static unmute () {
        Logger.setThreshold(Logger._oldthreshold);
        Logger._muted = false;
    }

    // ----------------------------------------------

    constructor () {
        let me = this;
        levels.forEach((level, idx) => {
            me[level] = (message) => {
                if (idx<=Logger._threshold) {
                    console.log(message);
                }
            }
        })
    }

    log (message) {
        if (!Logger._muted) {
            console.log(message);
        }
    }

    setThreshold (threshold) {
        Logger.setThreshold(threshold);
    }
}

Logger._threshold = 0;

module.exports = new Logger();