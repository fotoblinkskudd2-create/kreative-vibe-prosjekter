"use strict";

/* ============================== DATA ============================== */

const CATEGORIES = {
  jobb: {
    label: "Jobb",
    emoji: "💼",
    keywords: ["jobb", "sjef", "kollega", "frist", "deadline", "møte", "karriere",
      "oppsigelse", "lønn", "prosjekt", "rapport", "kunde", "epost", "e-post", "presentasjon",
      "kontrakt", "tilbud", "ledelse", "medarbeider", "permisjon", "overtid", "arbeidskontrakt"],
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
      "mor", "far", "konflikt", "krangle", "forhold", "barn", "kone", "mann",
      "søsken", "svigers", "vennskap", "brudd", "ensomhet", "savner", "kommunikasjon"],
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
      "lønn", "faktura", "lån", "kredittkort", "husleie", "strøm", "abonnement",
      "inkasso", "skattemelding", "nedbetaling", "investering", "formue", "broke"],
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
      "syk", "angst", "utbrent", "trøtt", "sliten", "vekt", "doktor", "lege",
      "smerter", "depresjon", "panikk", "uro", "hodepine", "motivasjon", "vaner"],
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
      "blokkering", "låt", "sang", "manus", "tegne", "design", "kreativ",
      "fotografi", "podkast", "blogg", "roman", "spill", "skapes", "produsere"],
    steps: [
      "Sett en timer på 10 minutter og bare lag noe dårlig — kvalitet kommer senere.",
      "Vis det du har til én person du stoler på, selv om det ikke er ferdig.",
      "Bytt verktøy eller medium for én økt: skriv for hånd, tegn i stedet for å skrive, osv."
    ]
  },
  studier: {
    label: "Studier",
    emoji: "📚",
    keywords: ["studier", "skole", "eksamen", "forelesning", "pensum", "oppgave",
      "karakter", "vurdering", "student", "university", "bachelor", "master",
      "essay", "innlevering", "lærer", "professor", "gruppearbeid", "lese", "pugge"],
    steps: [
      "Del pensumet i bolker og gjør én bolk per dag til eksamen — skriv planen ned nå.",
      "Test deg selv aktivt i stedet for å lese passivt: lag spørsmål og svar på dem.",
      "Ta en Pomodoro nå: 25 minutter fokus, 5 minutters pause — start klokken."
    ]
  },
  teknikk: {
    label: "Teknikk",
    emoji: "🛠️",
    keywords: ["kode", "bug", "feil", "software", "hardware", "program", "app",
      "server", "database", "api", "error", "deploy", "git", "python", "javascript",
      "teknisk", "system", "nettverk", "konfigurasjon", "crash", "installere"],
    steps: [
      "Reproduser problemet konsistent — skriv nøyaktig hvilke steg som trigger det.",
      "Isoler variabelen: bytt ut én ting om gangen til feilen forsvinner.",
      "Spør om hjelp med en nøyaktig problemformulering — Stack Overflow, kollega eller dokumentasjon."
    ]
  },
  usikkerhet: {
    label: "Usikkerhet",
    emoji: "🌫️",
    keywords: ["usikker", "vet ikke", "ikke vet", "lost", "uklar", "fortapt",
      "retning", "valg", "vet ikke hva", "forvirret", "fastlåst", "beslutning",
      "veivalg", "livet", "mening", "framtid", "plan", "prioritering"],
    steps: [
      "Skriv ned de tre mulige veiene du ser for deg akkurat nå — ingen er feil.",
      "Spør deg selv: «Hva ville jeg gjort om jeg ikke var redd?» — skriv svaret.",
      "Ta den enkleste, reversible handlingen som gir deg mer informasjon om veien videre."
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
  },
  {
    title: "Beslutningsmatrise",
    desc: "List de to-tre mulige løsningene. Score dem 1-5 på: effektivitet, kostnad, risiko, og om du faktisk gidder å gjennomføre. Velg høyest totalsum."
  },
  {
    title: "Fremtids-brev",
    desc: "Skriv et brev fra deg-om-ett-år til deg-nå. Hva vil den fremtidsdeg si om dette problemet? Hva er du glad for at du tok tak i?"
  },
  {
    title: "Worst Case Acceptance",
    desc: "Hva er det aller verste som kan skje? Skriv det ned. Spør så: «Kan jeg leve med det?» — Meist ja. Og det gjør det mye lettere å handle."
  },
  {
    title: "2-minutters regel",
    desc: "Kan neste skritt gjøres på under to minutter? Gjør det nå — umiddelbart, uten å planlegge mer."
  },
  {
    title: "Perspektivskifte: 10/10/10",
    desc: "Hvordan vil dette se ut om 10 dager? 10 måneder? 10 år? De fleste problemer er mye mindre i det lange løp enn de føles akkurat nå."
  },
  {
    title: "Hva trenger du egentlig?",
    desc: "Under problemet ligger det ofte et behov: anerkjennelse, trygghet, kontroll, tilhørighet. Hva er det egentlige behovet her — og kan du møte det direkte?"
  },
  {
    title: "Ressurskartlegging",
    desc: "Du vet sannsynligvis mer og har mer hjelp tilgjengelig enn du tror. Skriv ned: hvem du kan spørre, hva du faktisk kan, og hva du allerede har prøvd."
  },
  {
    title: "Minska biten",
    desc: "Er neste steg for stort? Del det i to. For stort? Del det i to igjen. Fortsett til du har et steg som tar maks 5 minutter. Start der."
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
  "Stress er ofte bare en dårlig oversatt versjon av «dette betyr noe for meg».",
  "Handlingen skaper motivasjonen — ikke omvendt. Start, så kommer resten.",
  "Neste skritt er nok. Du trenger ikke hele kartet, bare det neste steget.",
  "Å be om hjelp er styrke, ikke svakhet. Hvem kan du ringe akkurat nå?",
  "Det eneste du vet sikkert er at ingenting gjøres av å tenke alene i eget hode.",
  "Vanskelige perioder avslutter seg selv hvis du handler konsekvent, en dag av gangen.",
  "Hva ville du sagt til en venn med dette problemet? Si det til deg selv.",
  "Ferdig slår alltid perfekt. Send det, lever det, møt opp.",
  "Frustrasjon er et signal om at du bryr deg nok til å ville gjøre det bedre.",
  "Usikkerhet er normaltilstanden. Alle tar valg med ufullstendig informasjon.",
  "Det du unngår styrer deg. Ta ett lite steg mot det du frykter i dag."
];

const LEVELS = [
  { min: 0,    title: "Problem-nybegynner 🐣" },
  { min: 50,   title: "Problemløser-lærling 🌱" },
  { min: 150,  title: "Knuser-i-trening 🔧" },
  { min: 300,  title: "ProblemKnuser 💥" },
  { min: 500,  title: "Kaostemmer 🌀" },
  { min: 800,  title: "Livets MacGyver 🛠️" },
  { min: 1200, title: "Strategi-ninja 🥷" },
  { min: 1700, title: "Vismor/Vismann på fjellet 🧙" },
  { min: 2300, title: "Problem-hvisker 🤫" },
  { min: 3000, title: "Universets Problemløser 🌌" }
];

const STORAGE_KEY = "problemknuser-state-v2";
const XP_PER_STEP = 10;
const XP_BONUS_COMPLETE = 20;

/* ============================== STATE ============================== */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      console.warn("[ProblemKnuser] Ugyldig state i localStorage, tilbakestiller.");
      return defaultState();
    }
    return parsed;
  } catch (e) {
    console.warn("[ProblemKnuser] Korrupt state i localStorage, tilbakestiller:", e.message);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    return defaultState();
  }
}

function defaultState() {
  return { xp: 0, streak: 0, lastSolvedDate: null, history: [], totalSolved: 0 };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      console.warn("[ProblemKnuser] localStorage-kvote oversteget — trimmer historikk.");
      state.history = state.history.slice(0, 20);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    } else {
      console.warn("[ProblemKnuser] Kunne ikke lagre state:", e.message);
    }
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
  return Math.floor((date - start) / 86400000);
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  let best = "annet";
  let bestScore = 0;
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    if (key === "annet") continue;
    // Vektet scoring: eksakt ord-match > delstreng-match
    const score = cat.keywords.reduce((acc, kw) => {
      const kwLower = kw.toLowerCase();
      if (lower.includes(kwLower)) {
        // Gi høyere score til hele-ord-treff
        const wordMatch = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
        return acc + (wordMatch ? 2 : 1);
      }
      return acc;
    }, 0);
    if (score > bestScore) { bestScore = score; best = key; }
  }
  return best;
}

function currentLevel(xp) {
  let level = LEVELS[0];
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) { level = LEVELS[i]; index = i; }
  }
  return { ...level, index, next: LEVELS[index + 1] || null };
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

  const totalEl = document.getElementById("total-solved");
  if (totalEl) totalEl.textContent = state.totalSolved || 0;
}

function renderDailyVibe() {
  const idx = dayOfYear() % DAILY_QUOTES.length;
  document.getElementById("daily-vibe").textContent = `💭 ${DAILY_QUOTES[idx]}`;
}

function renderCategoryPreview() {
  const el = document.getElementById("category-preview");
  if (!session.category) { el.classList.add("hidden"); return; }
  const cat = CATEGORIES[session.category];
  el.classList.remove("hidden");
  el.innerHTML = `<span style="font-size:1.2rem">${cat.emoji}</span> Dette ser ut som en <strong>${cat.label}</strong>-utfordring.`;
}

function renderHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "";

  if (!state.history || state.history.length === 0) {
    list.innerHTML = `<li class="history-empty">Ingen knuste problemer ennå. Knus ditt første! 💪</li>`;
    return;
  }

  state.history.slice(0, 15).forEach((item) => {
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

function renderStats() {
  const panel = document.getElementById("stats-panel");
  if (!panel) return;

  const catCounts = {};
  for (const item of (state.history || [])) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;
  }
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
  const topCatLabel = topCat
    ? `${CATEGORIES[topCat[0]]?.emoji || ""} ${CATEGORIES[topCat[0]]?.label || topCat[0]} (${topCat[1]})`
    : "—";

  panel.innerHTML = `
    <div class="stat-row"><span>Totalt løst</span><strong>${state.totalSolved || 0}</strong></div>
    <div class="stat-row"><span>Total XP</span><strong>${state.xp}</strong></div>
    <div class="stat-row"><span>Streak</span><strong>${state.streak} dag${state.streak !== 1 ? "er" : ""}</strong></div>
    <div class="stat-row"><span>Vanligste kategori</span><strong>${topCatLabel}</strong></div>
    <div class="stat-row"><span>Sist løst</span><strong>${state.lastSolvedDate || "—"}</strong></div>
  `;
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
  session.category = text.length >= 6 ? detectCategory(text) : null;
  renderCategoryPreview();
  analyzeBtn.disabled = text.length < 6;
});

analyzeBtn.addEventListener("click", () => {
  const text = problemInput.value.trim();
  if (text.length < 6) { problemInput.focus(); shake(problemInput); return; }
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
  // Unngå å velge samme teknikk to ganger på rad
  let pick;
  do { pick = TECHNIQUES[Math.floor(Math.random() * TECHNIQUES.length)]; }
  while (pick === session.technique && TECHNIQUES.length > 1);

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
  spawnConfetti(rect.left + rect.width / 2, rect.top, 16);
  renderSteps();
  renderTopbar();
  saveState();

  if (session.doneCount === session.steps.length) completeProblem();
});

function completeProblem() {
  state.xp += XP_BONUS_COMPLETE;
  state.totalSolved = (state.totalSolved || 0) + 1;

  const today = todayKey();
  if (state.lastSolvedDate !== today) {
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    state.streak = state.lastSolvedDate === yesterday ? state.streak + 1 : 1;
    state.lastSolvedDate = today;
  }

  if (!state.history) state.history = [];
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
  renderStats();
  spawnConfetti(window.innerWidth / 2, window.innerHeight / 3, 90);
  newProblemBtn.classList.remove("hidden");
}

newProblemBtn.addEventListener("click", resetSession);

function resetSession() {
  session = { problemText: "", category: null, technique: null, steps: [], doneCount: 0 };
  problemInput.value = "";
  analyzeBtn.disabled = true;
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
    const panel = document.getElementById(pid);
    if (panel) panel.classList.toggle("hidden", pid !== id);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================== HISTORY OG STATS ============================== */

document.getElementById("clear-history-btn").addEventListener("click", () => {
  if (!confirm("Nullstille HELE historikk, XP og streak? Dette kan ikke angres.")) return;
  state = defaultState();
  saveState();
  renderTopbar();
  renderHistory();
  renderStats();
});

/* ============================== EKSPORT / IMPORT ============================== */

const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");

if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `problemknuser-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (importBtn && importFile) {
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (typeof imported.xp !== "number") throw new Error("Ugyldig format");
        if (!confirm(`Erstatte nåværende data med importert data? Du mister ${state.xp} XP og ${state.streak} streak.`)) return;
        state = { ...defaultState(), ...imported };
        saveState();
        renderTopbar();
        renderHistory();
        renderStats();
        alert("Data importert!");
      } catch (err) {
        alert("Ugyldig backup-fil: " + err.message);
      }
    };
    reader.readAsText(file);
    importFile.value = "";
  });
}

/* ============================== ANIMASJON ============================== */

function shake(el) {
  el.classList.add("pulse");
  setTimeout(() => el.classList.remove("pulse"), 400);
}

/* ============================== CONFETTI ============================== */

const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let confettiRunning = false;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = ["#ff5fae", "#5fc9ff", "#ffd95f", "#5fffb0", "#c792ff", "#ff8c5f", "#5fff9d"];

function spawnConfetti(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -10 - 2,
      gravity: 0.3,
      size: Math.random() * 7 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 22,
      life: 0,
      maxLife: 70 + Math.random() * 40
    });
  }
  if (!confettiRunning) { confettiRunning = true; requestAnimationFrame(tickConfetti); }
}

function tickConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.vy += p.gravity; p.x += p.vx; p.y += p.vy;
    p.rotation += p.spin; p.life += 1;
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
  if (particles.length > 0) { requestAnimationFrame(tickConfetti); }
  else { confettiRunning = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

/* ============================== INIT ============================== */

function init() {
  renderTopbar();
  renderDailyVibe();
  renderHistory();
  renderStats();
  renderCategoryPreview();
  showPanel("panel-input");
  analyzeBtn.disabled = true;
}

init();
