const express = require("express");
const router = express.Router();

const processManager = require("../services/processManager");
const registry = require("../services/registry");
const messages = require("../services/messages");

function clientId(req) {
    return String(req.ip || "").replace(/^::ffff:/, "");
}

// Health
router.get("/", (req, res) => {});

// Create
router.post("/create-server", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    const { port } = processManager.createServer(name);
    res.json({ message: `${name} created on port ${port}` });
});

// Register
router.post("/register", (req, res) => {
    const { name, url } = req.body;
    if (!name || !url)
        return res.status(400).json({ error: "Name and URL required" });

    const owner = clientId(req);
    const claimed = registry.claimedBy(name);

    // Un nombre pertenece a la maquina que lo reclamo primero
    if (claimed && claimed !== owner) return res.status(409).json({ error: `Name "${name}" is already taken by another machine. Pick a different one.` });

    registry.register(name, url, owner);
    res.json({ message: "Server registered successfully" });
});

// Pulse
router.post("/pulse/:name", (req, res) => {
    const ok = registry.pulse(req.params.name);
    if (!ok) return res.status(404).json({ error: "Server not found" });

    res.json({ message: "Pulse received" });
});

// Kill
router.post("/kill-server/:name", (req, res) => {
    const killed = processManager.killServer(req.params.name);
    if (!killed) return res.status(404).json({ error: "Server not found" });

    registry.remove(req.params.name);
    res.json({ message: `${req.params.name} killed` });
});

// List
router.get("/servers", (req, res) => {
    res.json(registry.getAll());
});

// Overview
router.get("/overview", (req, res) => {
    res.json(registry.getAll().map(server => ({
        ...server,
        messages: messages.get(server.name)
    })));
});

// Receive a message from a mini server
router.post("/send-message/:name", (req, res) => {
    const { name } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "Message required" });
    if (!registry.exists(name)) return res.status(404).json({ error: "Server not found" });
    if (registry.claimedBy(name) !== clientId(req)) return res.status(403).json({ error: `Only ${name}'s own machine can send messages as ${name}` });

    const entry = messages.add(name, message);
    res.status(201).json(entry);
});

// Read the messages of a mini server
router.get("/send-message/:name", (req, res) => {
    res.json(messages.get(req.params.name));
});

module.exports = router;
