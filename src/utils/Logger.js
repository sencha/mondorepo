const levels = ['error', 'warn', 'info', 'debug'];

class Logger {
    constructor () {
        this.muted = 0;
        this.setThreshold('info');
    }

    log (...args) {
        if (!this.muted) {
            console.log(...args);
        }
    }

    error(...args) {
        if (!this.muted) {
            console.error(...args);
        }
    }

    warn(...args) {
        if (!this.muted) {
            console.warn(...args);
        }
    }

    info(...args) {
        if (!this.muted && this.info.enabled) {
            console.info(...args);
        }
    }

    debug(...args) {
        if (!this.muted && this.debug.enabled) {
            console.log(...args);
        }
    }

    setThreshold (threshold = 'info') {
        let enabled = true;

        for (let level of levels) {
            this[level].enabled = enabled;
            if (level === threshold) {
                enabled = false;
            }
        }
    }

    mute () {
        this.muted++;
    }

    unmute () {
        if (this.muted) {
            this.muted--;
        }
    }
}

module.exports = new Logger();
