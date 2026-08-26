const input = document.getElementById("nameInput");
const button = document.getElementById("createBtn");
const list = document.getElementById("serverList");

button.addEventListener("click", createServer);

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

        li.innerHTML = `
            <div class="server-head">
                <strong>${escapeHtml(server.name)}</strong>
                <a href="${server.url}" target="_blank">${server.url}</a>
            </div>
            <ul class="messages">${items}</ul>
        `;

        list.appendChild(li);
    });
}

loadServers();
setInterval(loadServers, 3000);
