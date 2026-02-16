const input = document.getElementById("nameInput");
const button = document.getElementById("createBtn");
const list = document.getElementById("serverList");

button.addEventListener("click", createServer);

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

    list.innerHTML = "";

    servers.forEach(server => {
        const url = server.url;
        const port = new URL(url).port;

        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${server.name}</strong>
            — <a href="${url}" target="_blank">
                ${url}
            </a>
        `;
        list.appendChild(li);
    });
}

loadServers();
setInterval(loadServers, 3000);