const axios = require("axios");

let pulseInterval = null;

function startPulse({ name, port, middlewareUrl, log }) {

    async function register() {
        await axios.post(`${middlewareUrl}/register`, {
            name,
            url: `http://localhost:${port}`
        });
    }

    async function sendPulse() {
        await axios.post(`${middlewareUrl}/pulse/${name}`);
    }

    return (async function init() {
        try {
            await register();
            log("INFO", "Registered successfully");

            pulseInterval = setInterval(async () => {
                try {
                    await sendPulse();
                    log("INFO", "Pulse sent");
                } catch {
                    log("ERROR", "No pulse");
                }
            }, 5000);

        } catch {
            log("ERROR", "Could not register to middleware");
        }
    })();
}

function stopPulse(log) {
    if (pulseInterval) {
        clearInterval(pulseInterval);
        pulseInterval = null;
        log("WARN", "Stopped sending pulse");
    }
}

module.exports = {
    startPulse,
    stopPulse
};
