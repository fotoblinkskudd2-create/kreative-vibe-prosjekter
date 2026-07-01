/* ============================================================
   VIBE-KORT — appmotor
   Global scope med vilje (ingen bundler) — se merknad i cards.js.
   ============================================================ */

(() => {
  "use strict";

  const STORAGE_FAVS = "vibekort:favorites";
  const STORAGE_FILTER = "vibekort:filter";

  const el = (id) => document.getElementById(id);
  const $card = el("card");
  const $cardInner = $card.querySelector(".card-inner");
  const $frontSymbol = el("frontSymbol");
  const $cornerTL = el("cornerTL");
  const $cornerBR = el("cornerBR");
  const $category = el("cardCategory");
  const $title = el("cardTitle");
  const $pitch = el("cardPitch");
  const $effort = el("cardEffort");
  const $cardId = el("cardId");
  const $watermark = el("cardWatermark");
  const $saveBtn = el("saveBtn");
  const $deckPos = el("deckPos");
  const $deckTotal = el("deckTotal");
  const $prevBtn = el("prevBtn");
  const $nextBtn = el("nextBtn");
  const $drawBtn = el("drawBtn");
  const $shuffleBtn = el("shuffleBtn");
  const $chips = Array.from(document.querySelectorAll(".chip"));
  const $favToggle = el("favToggle");
  const $favCount = el("favCount");
  const $favDrawer = el("favDrawer");
  const $favClose = el("favClose");
  const $favList = el("favList");
  const $favEmpty = el("favEmpty");
  const $exportBtn = el("exportBtn");
  const $clearFavBtn = el("clearFavBtn");
  const $scrim = el("drawerScrim");
  const $toast = el("toast");

  // ---------- State ----------

  let deck = [];          // filtered + shuffled working set
  let index = 0;
  let flipped = false;
  let activeFilter = localStorage.getItem(STORAGE_FILTER) || "alle";
  let favorites = loadFavorites();

  // ---------- Utilities ----------

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function loadFavorites() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_FAVS) || "[]");
      return new Set(Array.isArray(raw) ? raw : []);
    } catch {
      return new Set();
    }
  }

  function persistFavorites() {
    localStorage.setItem(STORAGE_FAVS, JSON.stringify(Array.from(favorites)));
  }

  function cardById(id) {
    return CARDS.find((c) => c.id === id);
  }

  let toastTimer = null;
  function showToast(msg) {
    $toast.textContent = msg;
    $toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $toast.classList.remove("is-visible"), 2200);
  }

  // ---------- Deck building ----------

  function buildDeck(filter, { preserveOrder } = {}) {
    const pool = filter === "alle" ? CARDS : CARDS.filter((c) => c.category === filter);
    deck = preserveOrder ? pool.slice() : shuffle(pool);
    index = 0;
    flipped = false;
  }

  function updateChipCounts() {
    const counts = { alle: CARDS.length };
    for (const key of Object.keys(CATEGORIES)) counts[key] = 0;
    for (const c of CARDS) counts[c.category]++;
    document.querySelectorAll("[data-count]").forEach((n) => {
      n.textContent = counts[n.dataset.count] ?? 0;
    });
  }

  // ---------- Rendering ----------

  function render() {
    const card = deck[index];
    if (!card) return;
    const meta = CATEGORIES[card.category];

    $card.style.setProperty("--accent", meta.color);
    $card.style.setProperty("--glow", meta.glow);
    $frontSymbol.textContent = meta.symbol;
    $cornerTL.textContent = meta.symbol;
    $cornerBR.textContent = meta.symbol;

    $watermark.textContent = meta.symbol;
    $category.textContent = meta.short;
    $title.textContent = card.title;
    $pitch.textContent = card.pitch;
    $effort.textContent = EFFORT_LABEL[card.effort] || "";
    $cardId.textContent = "#" + String(card.id).padStart(3, "0");

    const isFav = favorites.has(card.id);
    $saveBtn.setAttribute("aria-pressed", String(isFav));

    $card.classList.toggle("is-flipped", flipped);

    $deckPos.textContent = String(index + 1);
    $deckTotal.textContent = String(deck.length);
    $prevBtn.disabled = deck.length <= 1;
    $nextBtn.disabled = deck.length <= 1;

    $favCount.textContent = String(favorites.size);
    $favToggle.setAttribute("aria-expanded", String($favDrawer.classList.contains("is-open")));
  }

  function goTo(newIndex, { keepFlip } = {}) {
    if (!deck.length) return;
    index = ((newIndex % deck.length) + deck.length) % deck.length;
    flipped = Boolean(keepFlip) && flipped;
    render();
  }

  function drawRandom() {
    if (deck.length === 0) return;
    flipped = false;
    render();
    let next = index;
    if (deck.length > 1) {
      while (next === index) next = Math.floor(Math.random() * deck.length);
    }
    index = next;
    // liten forsinkelse gir en følelse av å faktisk "trekke" et kort
    requestAnimationFrame(() => {
      render();
      setTimeout(() => {
        flipped = true;
        render();
      }, 90);
    });
  }

  function toggleFlip() {
    flipped = !flipped;
    render();
  }

  // ---------- Favorites ----------

  function toggleFavorite() {
    const card = deck[index];
    if (!card) return;
    if (favorites.has(card.id)) {
      favorites.delete(card.id);
      showToast("Fjernet fra lagrede kort");
    } else {
      favorites.add(card.id);
      showToast("Lagret ♥");
    }
    persistFavorites();
    $saveBtn.classList.remove("pop");
    void $saveBtn.offsetWidth;
    $saveBtn.classList.add("pop");
    renderFavList();
    render();
  }

  function renderFavList() {
    const ids = Array.from(favorites);
    $favEmpty.hidden = ids.length > 0;
    $exportBtn.disabled = ids.length === 0;
    $clearFavBtn.disabled = ids.length === 0;
    $favList.innerHTML = "";

    ids
      .map(cardById)
      .filter(Boolean)
      .forEach((card) => {
        const meta = CATEGORIES[card.category];
        const li = document.createElement("li");
        li.className = "fav-item";
        li.style.setProperty("--accent-item", meta.color);
        li.innerHTML = `
          <div class="fav-item-body">
            <p class="fav-item-title">${meta.symbol} ${escapeHtml(card.title)}</p>
            <p class="fav-item-pitch">${escapeHtml(card.pitch)}</p>
          </div>
          <button class="fav-item-remove" aria-label="Fjern ${escapeHtml(card.title)}" data-id="${card.id}">✕</button>
        `;
        $favList.appendChild(li);
      });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function exportFavorites() {
    const ids = Array.from(favorites);
    const cards = ids.map(cardById).filter(Boolean);
    if (!cards.length) return;

    const today = new Date().toLocaleDateString("no-NO", { year: "numeric", month: "long", day: "numeric" });
    const byCategory = {};
    for (const c of cards) {
      (byCategory[c.category] ||= []).push(c);
    }

    let md = `# Vibe-kort — pitch-ark\n\n`;
    md += `_Satt sammen ${today} · ${cards.length} idé${cards.length === 1 ? "" : "er"} fra Vibe-kort-stokken_\n\n---\n\n`;

    for (const key of Object.keys(CATEGORIES)) {
      const group = byCategory[key];
      if (!group || !group.length) continue;
      const meta = CATEGORIES[key];
      md += `## ${meta.symbol} ${meta.label}\n\n`;
      for (const c of group) {
        md += `### ${c.title}\n${c.pitch}\n\n**Innsats:** ${EFFORT_LABEL[c.effort]}\n\n`;
      }
    }

    md += `---\n\n_Generert med Vibe-kort — kreative-vibe-prosjekter._\n`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibe-kort-pitch-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Pitch-ark lastet ned");
  }

  function clearFavorites() {
    if (!favorites.size) return;
    favorites.clear();
    persistFavorites();
    renderFavList();
    render();
    showToast("Listen er tømt");
  }

  // ---------- Drawer ----------

  function openDrawer() {
    $favDrawer.classList.add("is-open");
    $favDrawer.setAttribute("aria-hidden", "false");
    $scrim.hidden = false;
    $favToggle.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    $favDrawer.classList.remove("is-open");
    $favDrawer.setAttribute("aria-hidden", "true");
    $scrim.hidden = true;
    $favToggle.setAttribute("aria-expanded", "false");
  }

  // ---------- Event wiring ----------

  $card.addEventListener("click", toggleFlip);
  $card.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleFlip();
    }
  });

  $prevBtn.addEventListener("click", () => goTo(index - 1));
  $nextBtn.addEventListener("click", () => goTo(index + 1));
  $drawBtn.addEventListener("click", drawRandom);
  $shuffleBtn.addEventListener("click", () => {
    buildDeck(activeFilter);
    render();
    showToast("Kortstokken er stokket");
  });

  $saveBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite();
  });

  $chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      localStorage.setItem(STORAGE_FILTER, activeFilter);
      $chips.forEach((c) => c.classList.toggle("is-active", c === chip));
      buildDeck(activeFilter);
      render();
    });
  });

  $favToggle.addEventListener("click", () => {
    if ($favDrawer.classList.contains("is-open")) closeDrawer();
    else openDrawer();
  });
  $favClose.addEventListener("click", closeDrawer);
  $scrim.addEventListener("click", closeDrawer);

  $favList.addEventListener("click", (e) => {
    const btn = e.target.closest(".fav-item-remove");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    favorites.delete(id);
    persistFavorites();
    renderFavList();
    render();
  });

  $exportBtn.addEventListener("click", exportFavorites);
  $clearFavBtn.addEventListener("click", clearFavorites);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $favDrawer.classList.contains("is-open")) {
      closeDrawer();
      return;
    }
    if (document.activeElement === $card) return; // håndteres av kortets egen lytter
    if (e.key === "ArrowLeft") goTo(index - 1);
    else if (e.key === "ArrowRight") goTo(index + 1);
    else if (e.key.toLowerCase() === "f") toggleFavorite();
  });

  // ---------- Init ----------

  updateChipCounts();
  $chips.forEach((c) => c.classList.toggle("is-active", c.dataset.filter === activeFilter));
  buildDeck(activeFilter);
  render();
  renderFavList();
})();
