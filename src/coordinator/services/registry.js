const log = require("../utils/logger");

let servers = {};

function register(name, url, owner) {
    servers[name] = {
        name,
        url,
        owner,
        online: true,
        lastPulse: Date.now()
    };

    log("INFO", `Server registered: [${name}] from ${owner}`);
}

function pulse(name) {
    if (!servers[name]) return false;

    servers[name].lastPulse = Date.now();

    // Return from timeout
    if (!servers[name].online) {
        servers[name].online = true;
        log("INFO", `Server [${name}] is back online`);
    }

    return true;
}

function exists(name) {
    return Boolean(servers[name]);
}

function claimedBy(name) {
    return servers[name] ? servers[name].owner : null;
}

function setOffline(name) {
    if (servers[name]) servers[name].online = false;
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
    exists,
    claimedBy,
    setOffline,
    remove,
    getAll,
    getRaw
};
