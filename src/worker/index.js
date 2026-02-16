const createApp = require("./app");
const createLogger = require("./utils/logger");
const pulse = require("./services/pulse.service");

const PORT = process.argv[2];
const NAME = process.argv[3];
const MIDDLEWARE_URL = process.argv[4];

if (!PORT || !NAME) {
    console.error("PORT and NAME required");
    process.exit(1);
}

const log = createLogger(NAME);
const app = createApp({ port: PORT, name: NAME });

app.listen(PORT, async () => {

    log("INFO", `Server started on port ${PORT} for ${MIDDLEWARE_URL}`);

    await pulse.startPulse({
        name: NAME,
        port: PORT,
        middlewareUrl: MIDDLEWARE_URL,
        log
    });

});

app.post("/shutdown", (req, res) => {
    pulse.stopPulse(log);

    res.json({ message: `${NAME} shutting down...` });

    setTimeout(() => {
        process.exit(0);
    }, 500);
});

