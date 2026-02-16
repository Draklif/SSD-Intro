const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const log = require("../utils/logger");

let serverProcesses = {};
let nextPort = 4000;

function createServer(name) {
    const port = nextPort++;

    const workerPath = path.resolve(__dirname, "../../worker/index.js");

    console.log(process.env.MIDDLEWARE_URL)

    const middlewareUrl = process.env.MIDDLEWARE_URL || "http://localhost:3000";

    const child = spawn("node", [workerPath, port, name, middlewareUrl], {
        env: process.env
    });

    if (!fs.existsSync("logs")) {
        fs.mkdirSync("logs");
    }

    const logStream = fs.createWriteStream(`logs/${name}.log`, { flags: "a" });

    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);

    child.on("close", (code) => {
        log("INFO", `Server [${name}] exited with code ${code}`);
    });

    serverProcesses[name] = { process: child, port };

    log("INFO", `Started [${name}] on http://localhost:${port}`);

    return { port };
}

function killServer(name) {
    if (!serverProcesses[name]) return false;

    serverProcesses[name].process.kill();
    delete serverProcesses[name];

    log("INFO", `Killed [${name}]`);

    return true;
}

function getProcesses() {
    return serverProcesses;
}

module.exports = {
    createServer,
    killServer,
    getProcesses
};
