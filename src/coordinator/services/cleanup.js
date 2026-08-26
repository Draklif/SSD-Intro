const log = require("../utils/logger");
const registry = require("./registry");
const processManager = require("./processManager");

function startCleanup() {
    setInterval(() => {
        const now = Date.now();
        const timeout = 15000;

        const servers = registry.getRaw();

        Object.keys(servers).forEach(name => {
            if (now - servers[name].lastPulse <= timeout) return;
            if (!servers[name].online) return;

            log("WARN", `Server [${name}] timed out`);

            // Nodo local
            const killed = processManager.killServer(name);
            if (killed) { registry.remove(name); return; }

            // Nodo remoto
            registry.setOffline(name);
            log("WARN", `Server [${name}] marked offline`);
        });

    }, 10000);
}

module.exports = startCleanup;
