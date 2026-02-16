require("dotenv").config();

const app = require("./app");
const startCleanup = require("./services/cleanup");
const log = require("./utils/logger");

const PORT = 3000;

app.listen(PORT, () => {
    log("INFO", `Middleware running on http://localhost:${PORT}`);
});

startCleanup();