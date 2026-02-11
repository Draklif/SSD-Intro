const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.argv[2];
const NAME = process.argv[3];

const MIDDLEWARE_URL = "http://localhost:3000";

let pulseInterval; 

function log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] [${NAME}] ${message}`);
}

app.get("/", (req, res) => {
    res.send(`Server running on port ${PORT}`);
});

app.listen(PORT, async () => {
    log("INFO", `Server started on port ${PORT}`);

    try {
        await axios.post(`${MIDDLEWARE_URL}/register`, {
            name: NAME,
            url: `http://localhost:${PORT}`
        });

        log("INFO", "Registered successfully");

        pulseInterval = setInterval(async () => {
            try {
                await axios.post(`${MIDDLEWARE_URL}/heartbeat/${NAME}`);
                log("INFO", "Pulse sent");
            } catch (err) {
                log("ERROR", "No pulse");
            }
        }, 5000);

    } catch (err) {
        log("ERROR", "Could not register to middleware");
    }
});

app.post("/shutdown", (req, res) => {
    if (pulseInterval) {
        clearInterval(pulseInterval);
        pulseInterval = null;
        log("WARN", "Stopped sending heartbeats");
    }

    res.json({ message: `${NAME} heartbeat stopped` });
});