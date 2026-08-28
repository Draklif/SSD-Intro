const input = document.getElementById("nameInput");
const button = document.getElementById("createBtn");
const list = document.getElementById("serverList");
const reloadBtn = document.getElementById("reloadBtn");
const lastUpdate = document.getElementById("lastUpdate");

button.addEventListener("click", createServer);
reloadBtn.addEventListener("click", loadServers);

// Nunca confiamos en el texto que viene de otro nodo
function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

async function createServer() {
    const name = input.value.trim();
    if (!name) return;

    await fetch("/create-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    input.value = "";
    loadServers();
}

async function loadServers() {
    reloadBtn.disabled = true;
    reloadBtn.innerText = "Loading...";

    try {
        await renderServers();
        lastUpdate.innerText = `actualizado ${new Date().toLocaleTimeString()}`;
    } catch {
        lastUpdate.innerText = "no se pudo actualizar";
    }

    reloadBtn.disabled = false;
    reloadBtn.innerText = "Reload";
}

async function renderServers() {
    const res = await fetch("/servers");
    const servers = await res.json();

    // Un fetch de mensajes por cada nodo registrado
    const withMessages = await Promise.all(
        servers.map(async (server) => {
            const res = await fetch(`/send-message/${server.name}`);
            return { ...server, messages: await res.json() };
        })
    );

    list.innerHTML = "";

    withMessages.forEach(server => {
        const items = server.messages.length
            ? server.messages.map(entry => `
                <li class="message">
                    <span>${escapeHtml(entry.message)}</span>
                    <time>${new Date(entry.at).toLocaleTimeString()}</time>
                </li>
            `).join("")
            : `<li class="message empty">Sin mensajes</li>`;

        const li = document.createElement("li");

        const state = server.online ? "online" : "offline";

        li.innerHTML = `
            <div class="server-head">
                <strong>
                    <span class="dot ${state}" title="${state}"></span>
                    ${escapeHtml(server.name)}
                </strong>
                <span class="meta">
                    ${server.messages.length} msg · ${escapeHtml(server.owner || "?")}
                </span>
            </div>
            <ul class="messages">${items}</ul>
        `;

        list.appendChild(li);
    });
}

loadServers();
