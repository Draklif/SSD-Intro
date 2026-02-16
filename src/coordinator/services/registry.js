const log = require("../utils/logger");

let servers = {};

function register(name, url) {
    servers[name] = {
        name,
        url,
        lastPulse: Date.now()
    };

    log("INFO", `Server registered: [${name}]`);
}

function pulse(name) {
    if (!servers[name]) return false;

    servers[name].lastPulse = Date.now();
    return true;
}

function remove(name) {
    delete servers[name];
}

function getAll() {
    return Object.values(servers);
}

function getRaw() {
    return servers;
}

module.exports = {
    register,
    pulse,
    remove,
    getAll,
    getRaw
};
