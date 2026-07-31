/* Felles kjerne for Vibe Code Planner og Agent Run Planner.
   Ingen avhengigheter, ingen byggesteg. */

const Core = (() => {
  /* ---------- DOM ---------- */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, attrs = {}, kids = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : String(v));
    }
    for (const kid of [].concat(kids)) {
      if (kid === null || kid === undefined || kid === false) continue;
      node.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    }
    return node;
  }

  /* ---------- Tokens ---------- */

  // Grovt anslag. Norsk/engelsk kodeblandet tekst lander rundt 3,7 tegn per token.
  const CHARS_PER_TOKEN = 3.7;

  const tokens = (text) => (!text ? 0 : Math.ceil(String(text).length / CHARS_PER_TOKEN));

  function fmtTok(n) {
    n = Math.round(n || 0);
    if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace('.', ',') + 'M';
    if (n >= 10000) return Math.round(n / 1000) + 'k';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + 'k';
    return String(n);
  }

  const nf = new Intl.NumberFormat('nb-NO');
  const fmtNum = (n) => nf.format(Math.round(n || 0));

  function fmtMoney(usd, rate) {
    const u = usd || 0;
    const usdStr = '$' + (u < 10 ? u.toFixed(2) : u < 1000 ? u.toFixed(1) : fmtNum(u));
    if (!rate) return usdStr;
    const k = u * rate;
    return usdStr + ' · ' + (k < 100 ? k.toFixed(0) : fmtNum(k)) + ' kr';
  }

  function fmtDur(minutes) {
    const m = Math.round(minutes || 0);
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return rest ? `${h} t ${rest} min` : `${h} t`;
  }

  /* ---------- Modeller ---------- */
  // Standardprisene er anslag i USD per million tokens og kan overstyres i appen.

  const MODELS = {
    haiku: { id: 'haiku', name: 'Haiku 4.5', short: 'Haiku', in: 1, out: 5, speed: 0.55, power: 1 },
    sonnet: { id: 'sonnet', name: 'Sonnet 5', short: 'Sonnet', in: 3, out: 15, speed: 1, power: 2 },
    opus: { id: 'opus', name: 'Opus 5', short: 'Opus', in: 15, out: 75, speed: 1.45, power: 3 }
  };

  const MODEL_IDS = ['haiku', 'sonnet', 'opus'];

  // Prompt caching: skriving koster mer enn vanlig input, lesing mye mindre.
  const CACHE_WRITE_MULT = 1.25;
  const CACHE_READ_MULT = 0.1;

  function prices(overrides) {
    const p = {};
    for (const id of MODEL_IDS) {
      const o = (overrides && overrides[id]) || {};
      p[id] = {
        in: Number.isFinite(+o.in) && +o.in >= 0 ? +o.in : MODELS[id].in,
        out: Number.isFinite(+o.out) && +o.out >= 0 ? +o.out : MODELS[id].out
      };
    }
    return p;
  }

  /** Kostnad i USD for ett kall. */
  function cost({ model, input = 0, output = 0, cacheRead = 0, cacheWrite = 0 }, priceTable) {
    const p = (priceTable || prices())[model] || prices()[model] || MODELS.sonnet;
    const M = 1e6;
    return (
      (input * p.in) / M +
      (output * p.out) / M +
      (cacheRead * p.in * CACHE_READ_MULT) / M +
      (cacheWrite * p.in * CACHE_WRITE_MULT) / M
    );
  }

  /* ---------- Modellruting ---------- */

  // Hva slags arbeid oppgaven er. Vekten styrer hvor mye modellkraft som trengs.
  const TASK_KINDS = {
    setup: { label: 'Oppsett / stillas', weight: 0, outRatio: 1.1 },
    research: { label: 'Utforsk / kartlegg', weight: 0.4, outRatio: 0.35 },
    implement: { label: 'Implementer', weight: 1.4, outRatio: 1.0 },
    ui: { label: 'UI / layout', weight: 1.0, outRatio: 1.2 },
    debug: { label: 'Feilsøk', weight: 2.0, outRatio: 0.6 },
    refactor: { label: 'Refaktorer', weight: 1.2, outRatio: 0.9 },
    test: { label: 'Tester', weight: 0.8, outRatio: 1.0 },
    review: { label: 'Gjennomgang', weight: 1.6, outRatio: 0.4 },
    architecture: { label: 'Arkitektur / design', weight: 2.4, outRatio: 0.6 },
    docs: { label: 'Dokumentasjon', weight: 0.2, outRatio: 1.0 },
    content: { label: 'Tekst / innhold', weight: 0.6, outRatio: 1.3 },
    chore: { label: 'Rydding / smått', weight: 0, outRatio: 0.7 }
  };

  const SIZES = {
    S: { label: 'S — liten', factor: 1, baseMin: 4, tokens: 6000 },
    M: { label: 'M — middels', factor: 2.2, baseMin: 11, tokens: 16000 },
    L: { label: 'L — stor', factor: 4.2, baseMin: 26, tokens: 38000 }
  };

  /**
   * Foreslår modell ut fra hva oppgaven er, hvor stor den er og hvor mye
   * som står på spill. Terskelene er bevisst konservative: standarden er
   * den billigste modellen som holder.
   */
  function routeModel(task) {
    const kind = TASK_KINDS[task.kind] || TASK_KINDS.implement;
    const size = SIZES[task.size] || SIZES.M;

    let score = kind.weight;
    score += { S: -0.5, M: 0, L: 0.9 }[task.size] ?? 0;
    if (task.risk) score += 1.1; // Kritisk / vanskelig å reversere.
    if (task.vague) score += 0.7; // Uklar spec — trenger mer resonnering.

    const model = score >= 2.5 ? 'opus' : score >= 1.0 ? 'sonnet' : 'haiku';
    return { model, score, kind, size };
  }

  /** Anslått input/output-tokens for en oppgave. */
  function taskTokens(task, ctxTokens = 8000) {
    const { kind, size } = routeModel(task);
    const rounds = task.rounds || (task.size === 'L' ? 4 : task.size === 'M' ? 3 : 2);
    // Hver runde sender med kontekst på nytt; caching håndteres separat.
    const input = ctxTokens * rounds + size.tokens * 0.5 * rounds;
    const output = size.tokens * kind.outRatio;
    return { input: Math.round(input), output: Math.round(output), rounds };
  }

  /** Anslått tid i minutter (agent-arbeid, ikke menneskearbeid). */
  function taskMinutes(task, model) {
    const size = SIZES[task.size] || SIZES.M;
    const m = MODELS[model] || MODELS.sonnet;
    const rounds = task.rounds || (task.size === 'L' ? 4 : task.size === 'M' ? 3 : 2);
    return size.baseMin * m.speed * (0.6 + rounds * 0.16);
  }

  /* ---------- Avhengigheter → bølger ---------- */

  /**
   * Deler oppgaver i bølger (nivåer) der alt i samme bølge kan kjøres
   * parallelt. Sykluser brytes ved å legge resten i en siste bølge.
   */
  function waves(tasks) {
    const byId = new Map(tasks.map((t) => [t.id, t]));
    const done = new Set();
    const out = [];
    let left = tasks.slice();
    let guard = 0;

    while (left.length && guard++ < 60) {
      const ready = left.filter((t) =>
        (t.deps || []).filter((d) => byId.has(d)).every((d) => done.has(d))
      );
      if (!ready.length) {
        out.push(left.slice()); // Syklus: legg resten samlet.
        left = [];
        break;
      }
      out.push(ready);
      ready.forEach((t) => done.add(t.id));
      left = left.filter((t) => !done.has(t.id));
    }
    return out;
  }

  /* ---------- Lagring ---------- */

  const store = {
    load(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const val = JSON.parse(raw);
        return val && typeof val === 'object' ? { ...fallback, ...val } : fallback;
      } catch {
        return fallback;
      }
    },
    save(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
        return true;
      } catch {
        return false;
      }
    },
    drop(key) {
      try { localStorage.removeItem(key); } catch { /* ignorer */ }
    }
  };

  /* ---------- Utdata ---------- */

  function toast(msg) {
    let t = $('#toast');
    if (!t) {
      t = el('div', { id: 'toast' });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 1900);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('Kopiert');
      return true;
    } catch {
      // Fallback for filsystem-/usikker kontekst.
      const ta = el('textarea', { style: 'position:fixed;opacity:0' });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      toast(ok ? 'Kopiert' : 'Kunne ikke kopiere — merk teksten manuelt');
      return ok;
    }
  }

  function download(filename, text, type = 'text/markdown') {
    const blob = new Blob([text], { type: type + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function pickFile(accept, cb) {
    const inp = el('input', { type: 'file', accept, style: 'display:none' });
    inp.addEventListener('change', () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { cb(String(r.result)); inp.remove(); };
      r.readAsText(f);
    });
    document.body.appendChild(inp);
    inp.click();
  }

  /* ---------- Tema ---------- */

  function initTheme() {
    const saved = (() => { try { return localStorage.getItem('planner.theme'); } catch { return null; } })();
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-theme-toggle]');
      if (!btn) return;
      const cur = document.documentElement.getAttribute('data-theme');
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const next = cur ? (cur === 'dark' ? 'light' : 'dark') : (sysDark ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('planner.theme', next); } catch { /* ignorer */ }
    });
  }

  /* ---------- Tekst ---------- */

  const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const bullets = (arr, prefix = '- ') => (arr.length ? arr.map((x) => prefix + x).join('\n') : '');
  const slug = (s) =>
    String(s || 'prosjekt')
      .toLowerCase()
      .replace(/[æ]/g, 'ae').replace(/[ø]/g, 'oe').replace(/[å]/g, 'aa')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'prosjekt';

  const uid = () => 't' + Math.random().toString(36).slice(2, 9);

  /** Enkle faner: knapper med data-tab, paneler med data-panel. */
  function initTabs(root, onChange) {
    const tabs = $$('[data-tab]', root);
    const show = (name) => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
      $$('[data-panel]', root).forEach((p) => {
        p.hidden = p.dataset.panel !== name;
      });
      if (onChange) onChange(name);
    };
    tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.tab)));
    if (tabs.length) show(tabs[0].dataset.tab);
    return show;
  }

  return {
    $, $$, el,
    tokens, fmtTok, fmtNum, fmtMoney, fmtDur,
    MODELS, MODEL_IDS, TASK_KINDS, SIZES,
    CACHE_WRITE_MULT, CACHE_READ_MULT,
    prices, cost, routeModel, taskTokens, taskMinutes, waves,
    store, toast, copy, download, pickFile, initTheme, initTabs,
    lines, bullets, slug, uid
  };
})();
