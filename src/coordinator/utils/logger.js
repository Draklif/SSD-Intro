function log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] [COORDINATOR] ${message}`);
}

module.exports = log;