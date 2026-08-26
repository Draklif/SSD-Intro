const createApp = require("./app");
const createLogger = require("./utils/logger");
const pulse = require("./services/pulse.service");
const messageService = require("./services/message.service");

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

// El front le manda el mensaje a SU mini server, y este lo reenvia al coordinador
app.post("/send-message", async (req, res) => {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "Message required" });

    try {
        const entry = await messageService.sendMessage({
            name: NAME,
            message,
            middlewareUrl: MIDDLEWARE_URL,
            log
        });

        res.status(201).json(entry);

    } catch (err) {
        // "No contesto" y "contesto con error" son fallas distintas: no las mezclamos
        if (err.response) {
            log("ERROR", `Coordinator rejected the message (${err.response.status})`);
            return res.status(err.response.status).json(err.response.data);
        }

        // El coordinador puede estar caido: el mini server sigue vivo igual
        log("ERROR", "Could not reach the coordinator");
        res.status(502).json({ error: "Coordinator unreachable" });
    }
});

app.post("/shutdown", (req, res) => {
    pulse.stopPulse(log);

    res.json({ message: `${NAME} shutting down...` });

    setTimeout(() => {
        process.exit(0);
    }, 500);
});

