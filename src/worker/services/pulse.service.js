const axios = require("axios");

let pulseInterval = null;

async function register({ name, port, middlewareUrl }) {
    await axios.post(`${middlewareUrl}/register`, {
        name,
        url: `http://localhost:${port}`
    }, { timeout: 5000 });
}

function startPulse({ name, middlewareUrl, log }) {
    stopPulse();

    pulseInterval = setInterval(async () => {
        try {
            await axios.post(`${middlewareUrl}/pulse/${name}`, {}, { timeout: 5000 });
            log("INFO", "Pulse sent");
        } catch {
            log("ERROR", "No pulse");
        }
    }, 5000);
}

function stopPulse(log) {
    if (!pulseInterval) return;

    clearInterval(pulseInterval);
    pulseInterval = null;

    if (log) log("WARN", "Stopped sending pulse");
}

module.exports = {
    register,
    startPulse,
    stopPulse
};
