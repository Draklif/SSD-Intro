const express = require("express");
const path = require("path");

function createApp({ port, name }) {

    const app = express();

    app.use(express.json());

    app.get("/info", (req, res) => {
        res.json({ name, port });
    });

    app.use(express.static(path.join(__dirname, "public")));

    return app;
}

module.exports = createApp;
