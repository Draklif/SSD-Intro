const log = require("../utils/logger");

let messages = {};

function add(name, message) {
    if (!messages[name]) messages[name] = [];

    const entry = {
        from: name,
        message,
        at: new Date().toISOString()
    };

    messages[name].push(entry);

    log("INFO", `Message from [${name}]: ${message}`);

    return entry;
}

function get(name) {
    return messages[name] || [];
}

function remove(name) {
    delete messages[name];
}

function getAll() {
    return messages;
}

module.exports = {
    add,
    get,
    remove,
    getAll
};
