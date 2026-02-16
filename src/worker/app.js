const express = require("express");

function createApp({ port }) {

    const app = express();

    app.get("/", (req, res) => {
        res.send(`Server running on port ${port}`);
    });

    return app;
}

module.exports = createApp;
