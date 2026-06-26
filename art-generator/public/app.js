// Uses shared: escapeHtml, el, setStatus from /shared/js/dom-utils.js
const promptEl = document.getElementById("prompt");
const countEl = document.getElementById("count");
const sizeEl = document.getElementById("size");
const generateBtn = document.getElementById("generateBtn");
const statusEl = document.getElementById("status");
const gallery = document.getElementById("gallery");
const cardTemplate = document.getElementById("cardTemplate");

function showStatus(message, isError = false) {
  setStatus(statusEl, message, isError);
}

function imageSrc(image) {
  return image.url || `data:image/png;base64,${image.b64}`;
}

function addCard(image) {
  const node = cardTemplate.content.cloneNode(true);
  const card = node.querySelector(".card");
  const img = node.querySelector(".card-img");
  const keepBtn = node.querySelector(".keep-btn");
  const discardBtn = node.querySelector(".discard-btn");
  const consortBtn = node.querySelector(".consort-btn");

  img.src = imageSrc(image);
  card.dataset.url = image.url || "";

  keepBtn.addEventListener("click", () => {
    card.classList.toggle("kept");
  });

  discardBtn.addEventListener("click", () => {
    card.classList.add("discarding");
    setTimeout(() => card.remove(), 200);
  });

  consortBtn.addEventListener("click", () => makeConsorts(image, consortBtn));

  gallery.prepend(card);
}

async function generate() {
  const prompt = promptEl.value.trim();
  if (!prompt) {
    showStatus("Type a prompt first.", true);
    return;
  }

  generateBtn.disabled = true;
  showStatus("Generating art...");

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        count: Number(countEl.value),
        size: sizeEl.value,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generation failed.");

    data.images.forEach(addCard);
    showStatus(`Generated ${data.images.length} image(s).`);
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    generateBtn.disabled = false;
  }
}

async function makeConsorts(image, button) {
  if (!image.url) {
    showStatus("Consorts require a hosted image URL (not available for this image).", true);
    return;
  }

  button.disabled = true;
  showStatus("Breeding consorts from this image...");

  try {
    const res = await fetch("/api/variations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: image.url, count: 2 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Consort generation failed.");

    data.images.forEach(addCard);
    showStatus(`Bred ${data.images.length} consort(s).`);
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    button.disabled = false;
  }
}

generateBtn.addEventListener("click", generate);
promptEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    generate();
  }
});
