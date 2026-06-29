const promptEl = document.getElementById("prompt");
const countEl = document.getElementById("count");
const sizeEl = document.getElementById("size");
const styleEl = document.getElementById("style");
const generateBtn = document.getElementById("generateBtn");
const statusEl = document.getElementById("status");
const gallery = document.getElementById("gallery");
const cardTemplate = document.getElementById("cardTemplate");
const promptHistoryEl = document.getElementById("promptHistory");

// Prompthistorikk lagret i sessionStorage (forsvinner ved lukking)
const HISTORY_KEY = "art-generator-history";
let promptHistory = [];
try {
  promptHistory = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
} catch { promptHistory = []; }

function saveHistory() {
  try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(promptHistory.slice(0, 20))); } catch {}
}

function addToHistory(prompt) {
  promptHistory = [prompt, ...promptHistory.filter((p) => p !== prompt)].slice(0, 10);
  saveHistory();
  renderHistory();
}

function renderHistory() {
  if (!promptHistory.length) { promptHistoryEl.innerHTML = ""; return; }
  promptHistoryEl.innerHTML =
    `<div class="history-label">Siste prompts:</div>` +
    promptHistory.map((p) =>
      `<button class="history-chip" title="${escHtml(p)}">${escHtml(p.length > 50 ? p.slice(0, 48) + "…" : p)}</button>`
    ).join("");

  promptHistoryEl.querySelectorAll(".history-chip").forEach((btn, i) => {
    btn.addEventListener("click", () => { promptEl.value = promptHistory[i]; promptEl.focus(); });
  });
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function imageSrc(image) {
  return image.url || `data:image/png;base64,${image.b64}`;
}

function escHtml(str) {
  const d = document.createElement("div"); d.textContent = str; return d.innerHTML;
}

function addCard(image, promptText) {
  const node = cardTemplate.content.cloneNode(true);
  const card = node.querySelector(".card");
  const img = node.querySelector(".card-img");
  const keepBtn = node.querySelector(".keep-btn");
  const discardBtn = node.querySelector(".discard-btn");
  const consortBtn = node.querySelector(".consort-btn");
  const downloadBtn = node.querySelector(".download-btn");
  const promptLabel = node.querySelector(".card-prompt-label");

  img.src = imageSrc(image);
  card.dataset.url = image.url || "";
  if (promptText) promptLabel.textContent = promptText.slice(0, 80) + (promptText.length > 80 ? "…" : "");

  keepBtn.addEventListener("click", () => {
    card.classList.toggle("kept");
    keepBtn.textContent = card.classList.contains("kept") ? "✅ Beholdt" : "⭐ Behold";
  });

  discardBtn.addEventListener("click", () => {
    card.classList.add("discarding");
    setTimeout(() => card.remove(), 220);
  });

  consortBtn.addEventListener("click", () => makeConsorts(image, consortBtn));

  downloadBtn.addEventListener("click", () => downloadImage(image, promptText));

  gallery.prepend(card);
}

async function downloadImage(image, promptText) {
  const src = imageSrc(image);
  const filename = `kunst-${Date.now()}.png`;

  if (image.url) {
    // Hent via proxy for å unngå CORS-problemer
    try {
      const resp = await fetch(image.url);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      triggerDownload(url, filename);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: åpne i ny fane
      window.open(image.url, "_blank");
    }
  } else if (image.b64) {
    const url = `data:image/png;base64,${image.b64}`;
    triggerDownload(url, filename);
  }
}

function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

async function generate() {
  const prompt = promptEl.value.trim();
  if (!prompt) { setStatus("Skriv et prompt først.", true); return; }

  generateBtn.disabled = true;
  setStatus("Genererer kunst...");

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        style: styleEl.value || undefined,
        count: Number(countEl.value),
        size: sizeEl.value,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generering feilet.");

    addToHistory(prompt);
    data.images.forEach((img) => addCard(img, prompt));
    setStatus(`Genererte ${data.images.length} bilde(r). Bruk ⭐/🗑 for å velge, 🧬 for varianter, ⬇ for å laste ned.`);
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    generateBtn.disabled = false;
  }
}

async function makeConsorts(image, button) {
  if (!image.url) {
    setStatus("Varianter krever en hostet bilde-URL (ikke tilgjengelig for dette bildet).", true);
    return;
  }

  button.disabled = true;
  setStatus("Avler varianter fra dette bildet...");

  try {
    const res = await fetch("/api/variations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: image.url, count: 2 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Variantgenerering feilet.");

    data.images.forEach((img) => addCard(img, "(variant)"));
    setStatus(`Genererte ${data.images.length} variant(er).`);
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    button.disabled = false;
  }
}

// ─── Init ────────────────────────────────────────────────────────────────

generateBtn.addEventListener("click", generate);

promptEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
});

renderHistory();
