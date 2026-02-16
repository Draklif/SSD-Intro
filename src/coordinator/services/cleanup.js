const log = require("../utils/logger");
const registry = require("./registry");
const processManager = require("./processManager");

function startCleanup() {
    setInterval(() => {
        const now = Date.now();
        const timeout = 15000;

        const servers = registry.getRaw();

        Object.keys(servers).forEach(name => {
            if (now - servers[name].lastPulse > timeout) {

                log("INFO", `Server [${name}] timed out. Killing process...`);

                processManager.killServer(name);
                registry.remove(name);
            }
        });

    }, 10000);
}

module.exports = startCleanup;
