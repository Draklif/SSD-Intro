const nameEl = document.getElementById("serverName");
const portEl = document.getElementById("serverPort");
const button = document.getElementById("shutdownBtn");

const parentInput = document.getElementById("parentInput");
const parentBtn = document.getElementById("parentBtn");
const parentStatus = document.getElementById("parentStatus");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const statusEl = document.getElementById("status");

function setHint(el, text, type) {
    el.innerText = text;
    el.className = `hint ${type || ""}`;
}

async function loadInfo() {
    const res = await fetch("/info");
    const data = await res.json();

    nameEl.innerText = `Mini Server: ${data.name}`;
    portEl.innerText = `Running on port ${data.port}`;
}

async function loadParent() {
    const res = await fetch("/parent");
    const data = await res.json();

    parentInput.value = data.parent || "";
}

async function switchParent() {
    const url = parentInput.value.trim();
    if (!url) return;

    parentBtn.disabled = true;
    setHint(parentStatus, "Registrando...");

    try {
        const res = await fetch("/parent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await res.json();

        if (res.ok) {
            setHint(parentStatus, `Registrado en ${data.parent}`, "ok");
        } else {
            // Seguimos con el padre anterior
            setHint(parentStatus, data.error || `Error ${res.status}`, "error");
            await loadParent();
        }

    } catch {
        setHint(parentStatus, "Este mini server no responde", "error");
    }

    parentBtn.disabled = false;
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
            setHint(statusEl, "Enviado al coordinador", "ok");
        } else {
            const err = await res.json();
            setHint(statusEl, err.error || `Error ${res.status}`, "error");
        }

    } catch {
        setHint(statusEl, "Este mini server no responde", "error");
    }

    sendBtn.disabled = false;
}

parentBtn.addEventListener("click", switchParent);
sendBtn.addEventListener("click", sendMessage);

parentInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") switchParent();
});

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendMessage();
});

button.addEventListener("click", async () => {
    button.disabled = true;
    button.innerText = "Shutting down...";

    await fetch("/shutdown", { method: "POST" });
});

loadInfo();
loadParent();
