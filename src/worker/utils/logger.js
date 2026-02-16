function createLogger(name) {
    return function log(level, message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] [${name}] ${message}`);
    };
}

module.exports = createLogger;