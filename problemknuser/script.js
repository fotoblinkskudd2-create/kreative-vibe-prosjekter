"use strict";

/* ============================== DATA ============================== */

const CATEGORIES = {
  jobb: {
    label: "Jobb",
    emoji: "💼",
    keywords: ["jobb", "sjef", "kollega", "frist", "deadline", "møte", "karriere",
      "oppsigelse", "lønn", "prosjekt", "rapport", "kunde", "epost", "e-post", "presentasjon"],
    steps: [
      "Send en kort melding til den det gjelder og avklar forventningene innen 24 timer.",
      "Blokker 25 minutter i kalenderen i dag bare for å starte på den vanskeligste biten.",
      "List opp hva som er «godt nok» for denne oppgaven — perfekt kan vente."
    ]
  },
  relasjoner: {
    label: "Relasjoner",
    emoji: "❤️",
    keywords: ["kjæreste", "samboer", "ekspartner", "venn", "venninne", "familie",
      "mor", "far", "konflikt", "krangle", "forhold", "barn", "kone", "mann"],
    steps: [
      "Ta en prat ansikt til ansikt (eller videosamtale) i stedet for tekst — bestem et tidspunkt i dag.",
      "Skriv ned, bare for deg selv, hva du egentlig ønsker skal skje i denne relasjonen.",
      "Spør den andre personen ett konkret, åpent spørsmål — og lytt uten å forsvare deg."
    ]
  },
  penger: {
    label: "Penger",
    emoji: "💸",
    keywords: ["penger", "gjeld", "budsjett", "regning", "sparing", "økonomi",
      "lønn", "faktura", "lån", "kredittkort", "husleie"],
    steps: [
      "Sjekk kontosaldoen akkurat nå, uansett hvor skummelt det er.",
      "Lag en liste over alle utgifter du kan pause i 30 dager.",
      "Send én e-post eller melding og spør om betalingsplan, rabatt eller utsettelse."
    ]
  },
  helse: {
    label: "Helse",
    emoji: "🌿",
    keywords: ["helse", "sove", "søvn", "stress", "trene", "kosthold", "energi",
      "syk", "angst", "utbrent", "trøtt", "sliten", "vekt"],
    steps: [
      "Legg deg 30 minutter tidligere i kveld — bare den ene endringen.",
      "Ta en 10-minutters spasertur uten telefon.",
      "Skriv ned tre ting som faktisk gir deg energi, og gjør én av dem i dag."
    ]
  },
  kreativitet: {
    label: "Kreativitet",
    emoji: "🎨",
    keywords: ["idé", "prosjekt", "skrive", "musikk", "kunst", "inspirasjon",
      "blokkering", "låt", "sang", "manus", "tegne", "design"],
    steps: [
      "Sett en timer på 10 minutter og bare lag noe dårlig — kvalitet kommer senere.",
      "Vis det du har til én person du stoler på, selv om det ikke er ferdig.",
      "Bytt verktøy eller medium for én økt: skriv for hånd, tegn i stedet for å skrive, osv."
    ]
  },
  annet: {
    label: "Annet",
    emoji: "🧩",
    keywords: [],
    steps: [
      "Skriv problemet om til ett konkret spørsmål du kan svare på i dag.",
      "Finn én person som har løst noe lignende, og spør dem om råd.",
      "Gjør den minste mulige versjonen av neste skritt — to minutter er nok."
    ]
  }
};

const TECHNIQUES = [
  {
    title: "5 Hvorfor",
    desc: "Spør «hvorfor» fem ganger på rad for å komme til rotårsaken. Begynn med: «Hvorfor er dette egentlig et problem for meg?»"
  },
  {
    title: "Omvendt tenkning",
    desc: "Tenk ut hvordan du kunne gjort problemet enda verre. Det avslører ofte nøyaktig hva du bør unngå — og dermed hva du bør gjøre."
  },
  {
    title: "Den frempå vennen",
    desc: "Tenk på den mest frempå personen du kjenner. Hva ville de gjort i dag, akkurat nå, med dette problemet?"
  },
  {
    title: "Pre-mortem",
    desc: "Tenk deg at det går skikkelig dårlig om én uke. Hva var det som førte til det? Unngå akkurat den fellen."
  },
  {
    title: "Gummiand-forklaring",
    desc: "Forklar problemet høyt for en gummiand (eller kosedyr) som om den ikke vet noe som helst. Løsningen dukker ofte opp av seg selv halvveis."
  },
  {
    title: "Zoom ut",
    desc: "Tenk deg at dette er en god venns problem, ikke ditt eget. Hva ville du rådet vennen din til å gjøre?"
  },
  {
    title: "20-sekunders versjon",
    desc: "Du har bare 20 sekunder til å bestemme NESTE skritt — ikke hele løsningen. Hva blir det?"
  },
  {
    title: "Energi-sjekk",
    desc: "Spør deg selv: skyldes problemet egentlig mangel på tid, penger, energi eller mot? Svaret endrer hvilken løsning som faktisk funker."
  }
];

const DAILY_QUOTES = [
  "Du trenger ikke løse hele problemet i dag. Du trenger bare å gjøre det litt mindre.",
  "Perfekt er problemets beste vennen. Slå dem opp mot hverandre.",
  "De fleste problemer overlever ikke kontakt med en konkret handling.",
  "Hvis det føles for stort, er det fordi du ser på hele greia. Se på neste skritt.",
  "Du har løst vanskeligere ting enn dette før. Spør gårsdagens deg om råd.",
  "Et problem som er skrevet ned, er allerede 10 % løst.",
  "Det er lov å gjøre en dårlig versjon av løsningen først.",
  "Søk ikke det perfekte rådet — søk det neste lille skrittet.",
  "Du er ikke fast. Du er midt i en prosess som ikke er ferdig ennå.",
  "Stress er ofte bare en dårlig oversatt versjon av «dette betyr noe for meg»."
];

const LEVELS = [
  { min: 0, title: "Problem-nybegynner 🐣" },
  { min: 50, title: "Problemløser-lærling 🌱" },
  { min: 150, title: "Knuser-i-trening 🔧" },
  { min: 300, title: "ProblemKnuser 💥" },
  { min: 500, title: "Kaostemmer 🌀" },
  { min: 800, title: "Livets MacGyver 🛠️" },
  { min: 1200, title: "Strategi-ninja 🥷" },
  { min: 1700, title: "Vismor/Vismann på fjellet 🧙" },
  { min: 2300, title: "Problem-hvisker 🤫" },
  { min: 3000, title: "Universets Problemløser 🌌" }
];

const STORAGE_KEY = "problemknuser-state-v1";
const XP_PER_STEP = 10;
const XP_BONUS_COMPLETE = 20;

/* ============================== STATE ============================== */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Corrupt localStorage data for", STORAGE_KEY, "— resetting:", e.message);
    localStorage.removeItem(STORAGE_KEY);
  }
  return { xp: 0, streak: 0, lastSolvedDate: null, history: [] };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state to localStorage:", e.message);
  }
}

let state = loadState();

let session = {
  problemText: "",
  category: null,
  technique: null,
  steps: [],
  doneCount: 0
};

/* ============================== HELPERS ============================== */

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  let best = "annet";
  let bestScore = 0;
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    if (key === "annet") continue;
    const score = cat.keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return best;
}

function currentLevel(xp) {
  let level = LEVELS[0];
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) {
      level = LEVELS[i];
      index = i;
    }
  }
  const next = LEVELS[index + 1] || null;
  return { ...level, index, next };
}

/* ============================== RENDER ============================== */

function renderTopbar() {
  document.getElementById("streak-value").textContent = state.streak;

  const lvl = currentLevel(state.xp);
  document.getElementById("level-title").textContent = lvl.title;

  const fill = document.getElementById("xp-fill");
  const label = document.getElementById("xp-label");

  if (lvl.next) {
    const span = lvl.next.min - lvl.min;
    const progress = ((state.xp - lvl.min) / span) * 100;
    fill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    label.textContent = `${state.xp} / ${lvl.next.min} XP`;
  } else {
    fill.style.width = "100%";
    label.textContent = `${state.xp} XP (maks level!)`;
  }
}

function renderDailyVibe() {
  const idx = dayOfYear() % DAILY_QUOTES.length;
  document.getElementById("daily-vibe").textContent = `💭 ${DAILY_QUOTES[idx]}`;
}

function renderCategoryPreview() {
  const el = document.getElementById("category-preview");
  if (!session.category) {
    el.classList.add("hidden");
    return;
  }
  const cat = CATEGORIES[session.category];
  el.classList.remove("hidden");
  el.innerHTML = `<span style="font-size:1.2rem">${cat.emoji}</span> Dette ser ut som en <strong>${cat.label}</strong>-utfordring.`;
}

function renderHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "";

  if (state.history.length === 0) {
    list.innerHTML = `<li class="history-empty">Ingen knuste problemer ennå. Knus ditt første! 💪</li>`;
    return;
  }

  state.history.slice(0, 12).forEach((item) => {
    const cat = CATEGORIES[item.category] || CATEGORIES.annet;
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <div class="h-top">
        <span>${cat.emoji} ${cat.label}</span>
        <span class="h-date">${item.date}</span>
      </div>
      <div>${escapeHtml(item.problemText).slice(0, 90)}${item.problemText.length > 90 ? "…" : ""}</div>
      <div class="h-date">+${item.xp} XP · ${item.technique}</div>
    `;
    list.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ============================== FLOW: STEP 1 — INPUT ============================== */

const problemInput = document.getElementById("problem-input");
const analyzeBtn = document.getElementById("analyze-btn");

problemInput.addEventListener("input", () => {
  const text = problemInput.value.trim();
  if (text.length >= 6) {
    session.category = detectCategory(text);
  } else {
    session.category = null;
  }
  renderCategoryPreview();
});

analyzeBtn.addEventListener("click", () => {
  const text = problemInput.value.trim();
  if (text.length < 6) {
    problemInput.focus();
    problemInput.classList.add("pulse");
    setTimeout(() => problemInput.classList.remove("pulse"), 400);
    return;
  }
  session.problemText = text;
  session.category = detectCategory(text);
  renderCategoryPreview();
  showPanel("panel-perspective");
});

/* ============================== FLOW: STEP 2 — PERSPECTIVE ============================== */

const spinBtn = document.getElementById("spin-btn");
const lockTechniqueBtn = document.getElementById("lock-technique-btn");
const techniqueCard = document.getElementById("technique-card");

spinBtn.addEventListener("click", () => {
  const pick = TECHNIQUES[Math.floor(Math.random() * TECHNIQUES.length)];
  session.technique = pick;

  techniqueCard.classList.add("pulse");
  setTimeout(() => techniqueCard.classList.remove("pulse"), 400);

  techniqueCard.querySelector(".technique-title").textContent = `🎯 ${pick.title}`;
  techniqueCard.querySelector(".technique-desc").textContent = pick.desc;

  lockTechniqueBtn.disabled = false;
});

lockTechniqueBtn.addEventListener("click", () => {
  buildSteps();
  showPanel("panel-plan");
});

/* ============================== FLOW: STEP 3 — ACTION PLAN ============================== */

const stepsList = document.getElementById("steps-list");
const newProblemBtn = document.getElementById("new-problem-btn");

function buildSteps() {
  const cat = CATEGORIES[session.category] || CATEGORIES.annet;
  session.steps = cat.steps.map((text) => ({ text, done: false }));
  session.doneCount = 0;
  renderSteps();
  newProblemBtn.classList.add("hidden");
}

function renderSteps() {
  stepsList.innerHTML = "";
  session.steps.forEach((step, idx) => {
    const li = document.createElement("li");
    li.className = "step-item" + (step.done ? " done" : "");
    li.innerHTML = `
      <input type="checkbox" ${step.done ? "checked" : ""} data-idx="${idx}">
      <span class="step-text">${escapeHtml(step.text)}</span>
      <span class="step-xp">+${XP_PER_STEP} XP</span>
    `;
    stepsList.appendChild(li);
  });
}

stepsList.addEventListener("change", (e) => {
  if (e.target.type !== "checkbox") return;
  const idx = Number(e.target.dataset.idx);
  const step = session.steps[idx];
  if (!step || step.done) return;

  step.done = true;
  session.doneCount += 1;
  state.xp += XP_PER_STEP;

  const rect = e.target.getBoundingClientRect();
  spawnConfetti(rect.left, rect.top, 18);

  renderSteps();
  renderTopbar();
  saveState();

  if (session.doneCount === session.steps.length) {
    completeProblem();
  }
});

function completeProblem() {
  state.xp += XP_BONUS_COMPLETE;

  const today = todayKey();
  if (state.lastSolvedDate !== today) {
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    state.streak = state.lastSolvedDate === yesterday ? state.streak + 1 : 1;
    state.lastSolvedDate = today;
  }

  state.history.unshift({
    date: today,
    problemText: session.problemText,
    category: session.category,
    technique: session.technique ? session.technique.title : "—",
    xp: session.steps.length * XP_PER_STEP + XP_BONUS_COMPLETE
  });
  state.history = state.history.slice(0, 50);

  saveState();
  renderTopbar();
  renderHistory();

  spawnConfetti(window.innerWidth / 2, window.innerHeight / 3, 80);
  newProblemBtn.classList.remove("hidden");
}

newProblemBtn.addEventListener("click", resetSession);

function resetSession() {
  session = { problemText: "", category: null, technique: null, steps: [], doneCount: 0 };
  problemInput.value = "";
  renderCategoryPreview();
  techniqueCard.querySelector(".technique-title").textContent = "Trykk «Spin» for å starte 🎡";
  techniqueCard.querySelector(".technique-desc").textContent = "";
  lockTechniqueBtn.disabled = true;
  stepsList.innerHTML = "";
  newProblemBtn.classList.add("hidden");
  showPanel("panel-input");
  problemInput.focus();
}

/* ============================== PANEL SWITCHING ============================== */

function showPanel(id) {
  ["panel-input", "panel-perspective", "panel-plan"].forEach((pid) => {
    document.getElementById(pid).classList.toggle("hidden", pid !== id);
  });
}

/* ============================== HISTORY CLEAR ============================== */

document.getElementById("clear-history-btn").addEventListener("click", () => {
  if (!confirm("Nullstille historikk, XP og streak? Dette kan ikke angres.")) return;
  state = { xp: 0, streak: 0, lastSolvedDate: null, history: [] };
  saveState();
  renderTopbar();
  renderHistory();
});

/* ============================== CONFETTI ============================== */

const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let confettiRunning = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = ["#ff5fae", "#5fc9ff", "#ffd95f", "#5fffb0", "#c792ff"];

function spawnConfetti(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -8 - 2,
      gravity: 0.25,
      size: Math.random() * 6 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 20,
      life: 0,
      maxLife: 70 + Math.random() * 30
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(tickConfetti);
  }
}

function tickConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.life += 1;

    const alpha = Math.max(0, 1 - p.life / p.maxLife);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  });

  particles = particles.filter((p) => p.life < p.maxLife);

  if (particles.length > 0) {
    requestAnimationFrame(tickConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ============================== INIT ============================== */

function init() {
  renderTopbar();
  renderDailyVibe();
  renderHistory();
  renderCategoryPreview();
  showPanel("panel-input");
}

init();
