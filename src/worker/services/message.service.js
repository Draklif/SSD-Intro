const axios = require("axios");

async function sendMessage({ name, message, middlewareUrl, log }) {

    const res = await axios.post(
        `${middlewareUrl}/send-message/${name}`,
        { message },
        { timeout: 3000 }
    );

    log("INFO", `Message sent to coordinator: ${message}`);

    return res.data;
}

module.exports = {
    sendMessage
};
