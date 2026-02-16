const nameEl = document.getElementById("serverName");
const portEl = document.getElementById("serverPort");
const button = document.getElementById("shutdownBtn");

async function loadInfo() {
    const res = await fetch("/info");
    const data = await res.json();

    nameEl.innerText = `Mini Server: ${data.name}`;
    portEl.innerText = `Running on port ${data.port}`;
}

button.addEventListener("click", async () => {
    button.disabled = true;
    button.innerText = "Shutting down...";

    await fetch("/shutdown", { method: "POST" });
});

loadInfo();