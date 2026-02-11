const fs = require("fs");
const express = require("express");
const { spawn } = require("child_process");

const app = express();
app.use(express.json());

const PORT = 3000;

// Almacenamiento en memoria
let servers = {};

// Servers
let serverProcesses = {};
let nextPort = 4000;

function log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] [COORDINATOR] ${message}`);
}

app.get("/", (req, res) => {
    res.send("Middleware is running 🚀");
});

// Crear servidor
app.post("/create-server", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const port = nextPort++;

    const process = spawn("node", ["miniServer.js", port, name]);

    if (!fs.existsSync("logs")) {
        fs.mkdirSync("logs");
    }

    const logStream = fs.createWriteStream(`logs/${name}.log`, { flags: "a" });

    process.stdout.pipe(logStream);
    process.stderr.pipe(logStream);

    process.on("close", (code) => {
        log("INFO", `Exited with code ${code}`);
    });

    serverProcesses[name] = {
        process,
        port
    };

    serverProcesses[name] = {
        process,
        port
    };

    log("INFO", `Started [${name}] on http://localhost:${port}`);

    res.json({ message: `${name} created on port ${port}` });
});

// Registrar servidor
app.post("/register", (req, res) => {
    const { name, url } = req.body;

    if (!name || !url) {
        return res.status(400).json({ error: "Name and URL required" });
    }

    servers[name] = {
        name,
        url,
        lastHeartbeat: Date.now()
    };

    log("INFO", `Server registered: [${name}]`);
    res.json({ message: "Server registered successfully" });
});

// Heartbeat
app.post("/heartbeat/:name", (req, res) => {
    const { name } = req.params;

    if (servers[name]) {
        servers[name].lastHeartbeat = Date.now();
        return res.json({ message: "Heartbeat received" });
    }

    res.status(404).json({ error: "Server not found" });
});

// Kill
app.post("/kill-server/:name", (req, res) => {
    const { name } = req.params;

    if (!serverProcesses[name]) {
        return res.status(404).json({ error: "Server not found" });
    }

    serverProcesses[name].process.kill();
    delete serverProcesses[name];
    delete servers[name];

    log("INFO", `Killed [${name}]`);

    res.json({ message: `${name} killed` });
});

// Obtener servidores activos
app.get("/servers", (req, res) => {
    res.json(Object.values(servers));
});

// Limpieza automática cada 10 segundos
setInterval(() => {
    const now = Date.now();
    const timeout = 15000; // 15 segundos sin heartbeat

    Object.keys(servers).forEach(name => {
        if (now - servers[name].lastHeartbeat > timeout) {

            log("INFO", `Server [${name}] timed out. Killing process...`);

            if (serverProcesses[name]) {
                serverProcesses[name].process.kill();
                delete serverProcesses[name];
            }

            delete servers[name];
        }
    });
}, 10000);

app.listen(PORT, () => {
    log("INFO", `Middleware running on http://localhost:${PORT}`);
});