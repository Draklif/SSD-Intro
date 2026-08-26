const nameEl = document.getElementById("serverName");
const portEl = document.getElementById("serverPort");
const button = document.getElementById("shutdownBtn");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const statusEl = document.getElementById("status");

async function loadInfo() {
    const res = await fetch("/info");
    const data = await res.json();

    nameEl.innerText = `Mini Server: ${data.name}`;
    portEl.innerText = `Running on port ${data.port}`;
}

function setStatus(text, type) {
    statusEl.innerText = text;
    statusEl.className = type;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    sendBtn.disabled = true;

    try {
        const res = await fetch("/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        if (res.ok) {
            messageInput.value = "";
            setStatus("Enviado al coordinador", "ok");
        } else {
            const err = await res.json();
            setStatus(err.error, "error");
        }

    } catch {
        setStatus("Este mini server no responde", "error");
    }

    sendBtn.disabled = false;
}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendMessage();
});

button.addEventListener("click", async () => {
    button.disabled = true;
    button.innerText = "Shutting down...";

    await fetch("/shutdown", { method: "POST" });
});

loadInfo();