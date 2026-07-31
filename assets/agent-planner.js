/* Agent Run Planner — modellvalg, bølger, budsjett og ferdige prompts. */

(() => {
  const { $, $$, el } = Core;
  const KEY = 'agentplanner.v2';
  const HANDOFF = 'planner.handoff';

  /* ---------- Tilstand ---------- */

  const newTask = (over = {}) => ({
    id: Core.uid(),
    title: '',
    kind: 'implement',
    size: 'M',
    model: 'auto',
    rounds: 0, // 0 = utled fra størrelse
    risk: false,
    vague: false,
    deps: [],
    ...over
  });

  const blank = () => ({
    name: '',
    mission: '',
    repo: 8000,
    window: 200000,
    parallel: 3,
    fresh: 1200,
    caching: true,
    autoRoute: true,
    checkpoints: true,
    rate: 10.5,
    overhead: 20,
    prices: {},
    tasks: [],
    notList: [],
    done: []
  });

  let S = Core.store.load(KEY, blank());
  if (!Array.isArray(S.tasks)) S.tasks = [];
  if (!S.prices) S.prices = {};

  const save = () => Core.store.save(KEY, S);

  /* ---------- Beregning ---------- */

  const priceTable = () => Core.prices(S.prices);

  const roundsFor = (t) => t.rounds || ({ S: 2, M: 3, L: 5 }[t.size] ?? 3);

  function modelFor(t) {
    if (!S.autoRoute && t.model !== 'auto') return t.model;
    if (t.model && t.model !== 'auto') return t.model;
    return Core.routeModel(t).model;
  }

  /** Stabil prefiks alle agentene deler — det som er verdt å cache. */
  const sharedTokens = () => Core.tokens(S.mission) + (+S.repo || 0);

  function analyseTask(t) {
    const model = modelFor(t);
    const rounds = roundsFor(t);
    const shared = sharedTokens();
    const fresh = (+S.fresh || 1200) * rounds;
    const size = Core.SIZES[t.size] || Core.SIZES.M;
    const kind = Core.TASK_KINDS[t.kind] || Core.TASK_KINDS.implement;
    const output = Math.round(size.tokens * kind.outRatio);

    let input = 0, cacheWrite = 0, cacheRead = 0;
    if (S.caching) {
      cacheWrite = shared;
      cacheRead = shared * (rounds - 1);
      input = fresh;
    } else {
      input = shared * rounds + fresh;
    }

    const cost = Core.cost({ model, input, output, cacheRead, cacheWrite }, priceTable());
    const minutes = Core.taskMinutes({ ...t, rounds }, model);
    // Toppbelastning i vinduet: prefiks + alt som er produsert i oppgaven.
    const peak = shared + fresh + output;

    return { model, rounds, input, output, cacheRead, cacheWrite, cost, minutes, peak, kind, size };
  }

  /** Bølger, med tak på hvor mange agenter som kan gå samtidig. */
  function schedule() {
    const idx = new Map(S.tasks.map((t, i) => [t.id, i]));
    const waves = Core.waves(S.tasks);
    const cap = Math.max(1, +S.parallel || 1);

    let wall = 0;
    const detail = waves.map((wave, wi) => {
      const items = wave.map((t) => ({ t, a: analyseTask(t), no: idx.get(t.id) + 1 }));
      // Med tak må lange bølger deles i puljer; hver pulje tar sin lengste oppgave.
      const sorted = items.slice().sort((a, b) => b.a.minutes - a.a.minutes);
      let waveMin = 0;
      for (let i = 0; i < sorted.length; i += cap) {
        waveMin += sorted[i].a.minutes; // Lengste i puljen styrer.
      }
      wall += waveMin;
      return { no: wi + 1, items, minutes: waveMin, batches: Math.ceil(items.length / cap) };
    });

    return { waves: detail, wall };
  }

  function totals() {
    const price = priceTable();
    const per = {};
    Core.MODEL_IDS.forEach((m) => { per[m] = { n: 0, input: 0, output: 0, cost: 0 }; });

    let input = 0, output = 0, cost = 0, serial = 0, peak = 0;

    for (const t of S.tasks) {
      const a = analyseTask(t);
      const inAll = a.input + a.cacheRead + a.cacheWrite;
      per[a.model].n++;
      per[a.model].input += inAll;
      per[a.model].output += a.output;
      per[a.model].cost += a.cost;
      input += inAll;
      output += a.output;
      cost += a.cost;
      serial += a.minutes;
      peak = Math.max(peak, a.peak);
    }

    const oh = 1 + (+S.overhead || 0) / 100;
    // Referanse: alt på den største modellen uten caching.
    let naive = 0;
    for (const t of S.tasks) {
      const rounds = roundsFor(t);
      const a = analyseTask(t);
      naive += Core.cost({
        model: 'opus',
        input: sharedTokens() * rounds + (+S.fresh || 1200) * rounds,
        output: a.output
      }, price);
    }

    const { waves, wall } = schedule();
    return {
      per, input, output, cost: cost * oh, rawCost: cost, serial, wall, peak,
      naive: naive * oh, waves, n: S.tasks.length
    };
  }

  /* ---------- Markdown ---------- */

  function mdRunbook() {
    const T = totals();
    const rate = +S.rate || 0;
    const L = [];
    L.push(`# Runbook — ${S.name || 'uten navn'}`, '');
    L.push(`${T.n} oppgaver · ${T.waves.length} bølger · maks ${S.parallel} agenter samtidig`);
    L.push(`Anslag: ${Core.fmtTok(T.input + T.output)} tokens · ${Core.fmtMoney(T.cost, rate)} · ${Core.fmtDur(T.wall)} parallelt (${Core.fmtDur(T.serial)} sekvensielt)`, '');

    L.push('## Fast kontekst', '');
    L.push(S.mission ? S.mission.trim() : '_Ingen fast kontekst lagt inn._', '');
    L.push(`Prefiks: ~${Core.fmtTok(sharedTokens())} tokens${S.caching ? ' — caches, så det betales fullt bare første gang per oppgave.' : ' — caching er av, så dette betales på nytt hver runde.'}`, '');

    T.waves.forEach((w) => {
      L.push(`## Bølge ${w.no}${w.items.length > 1 ? ` — ${w.items.length} oppgaver` : ''}`, '');
      if (w.batches > 1) L.push(`_Kjøres i ${w.batches} puljer med taket på ${S.parallel} samtidige agenter._`, '');
      w.items.forEach(({ t, a, no }) => {
        L.push(`### ${no}. ${t.title || 'Uten tittel'}`);
        L.push(`- Modell: **${Core.MODELS[a.model].name}**`);
        L.push(`- Type: ${a.kind.label} · størrelse ${t.size} · ~${a.rounds} runder${t.risk ? ' · kritisk' : ''}`);
        L.push(`- Anslag: ${Core.fmtTok(a.input + a.cacheRead + a.cacheWrite)} inn / ${Core.fmtTok(a.output)} ut · ${Core.fmtMoney(a.cost, rate)}`);
        if ((t.deps || []).length) {
          const names = t.deps.map((d) => S.tasks.findIndex((x) => x.id === d) + 1).filter((x) => x > 0);
          if (names.length) L.push(`- Krever først: ${names.join(', ')}`);
        }
        L.push('');
      });
      if (S.checkpoints) L.push(`**Stopp her.** Sjekk resultatet fra bølge ${w.no} før neste starter.`, '');
    });

    if (S.done && S.done.length) L.push('## Ferdig når', S.done.map((x) => `- [ ] ${x}`).join('\n'), '');

    L.push('## Hvis noe går sider ut',
      '- Går en oppgave over dobbelt anslag i runder: stopp, stram omfanget, start på nytt heller enn å fortsette.',
      '- Blir en oppgave avvist to ganger på samme punkt: flytt den opp en modell.',
      '- Fyller konteksten seg: start ny økt med runbooken og resultatet så langt, ikke hele historikken.',
      '');
    return L.join('\n').trim() + '\n';
  }

  function promptFor(t, no) {
    const a = analyseTask(t);
    const L = [];
    L.push(`## Kontekst`, '');
    L.push(S.mission ? S.mission.trim() : '_(ingen fast kontekst lagt inn)_', '');
    if (S.notList && S.notList.length) {
      L.push('**Ikke bygg dette:** ' + S.notList.join(', ') + '.', '');
    }
    L.push('## Oppgave ' + no, '');
    L.push(`**${t.title || 'Uten tittel'}**`, '');
    L.push(`Arbeidstype: ${a.kind.label}. Omfang: ${{ S: 'lite', M: 'middels', L: 'stort' }[t.size]}.`, '');
    if ((t.deps || []).length) {
      const names = t.deps
        .map((d) => S.tasks.find((x) => x.id === d))
        .filter(Boolean)
        .map((x) => x.title);
      if (names.length) L.push(`Bygger på at dette allerede er gjort: ${names.join('; ')}.`, '');
    }
    L.push('## Rammer',
      '- Bare denne oppgaven. Ikke fortsett til noe annet etterpå.',
      '- Ikke rør filer som ikke hører til oppgaven.',
      '- Ingen nye avhengigheter uten at du spør først.',
      '- Er kravet uklart: still ett konkret spørsmål før du koder.',
      `- Hold deg til omtrent ${a.rounds} runder. Trenger du flere, si fra om hvorfor i stedet for å fortsette.`,
      '- Avslutt med maks fem linjer: hva du endret, og hva jeg bør sjekke.',
      '');
    return L.join('\n').trim();
  }

  function mdPrompts() {
    if (!S.tasks.length) return 'Legg til oppgaver for å få prompts.';
    return S.tasks
      .map((t, i) => `${'='.repeat(58)}\nPROMPT ${i + 1}/${S.tasks.length} — ${Core.MODELS[modelFor(t)].name}\n${'='.repeat(58)}\n\n${promptFor(t, i + 1)}`)
      .join('\n\n');
  }

  function mdCsv() {
    const rate = +S.rate || 0;
    const rows = [['nr', 'oppgave', 'type', 'storrelse', 'modell', 'runder', 'inn_tokens', 'ut_tokens', 'usd', 'nok', 'minutter']];
    S.tasks.forEach((t, i) => {
      const a = analyseTask(t);
      rows.push([
        i + 1,
        '"' + String(t.title || '').replace(/"/g, '""') + '"',
        t.kind, t.size, a.model, a.rounds,
        a.input + a.cacheRead + a.cacheWrite, a.output,
        a.cost.toFixed(4), (a.cost * rate).toFixed(2),
        Math.round(a.minutes)
      ]);
    });
    return rows.map((r) => r.join(',')).join('\n') + '\n';
  }

  const OUTPUTS = {
    runbook: { md: mdRunbook, file: 'RUNBOOK.md', type: 'text/markdown' },
    prompts: { md: mdPrompts, file: 'prompts.md', type: 'text/markdown' },
    csv: { md: mdCsv, file: 'kostnad.csv', type: 'text/csv' }
  };
  let activeTab = 'runbook';

  /* ---------- Rendering ---------- */

  function renderFields() {
    $$('[data-f]').forEach((n) => {
      const k = n.dataset.f;
      if (Array.isArray(S[k]) || typeof S[k] === 'object') return;
      if (S[k] !== undefined && S[k] !== null) n.value = S[k];
    });
    $$('[data-toggle]').forEach((b) =>
      b.setAttribute('aria-pressed', String(!!S[b.dataset.toggle])));
    $('#missionSize').textContent = S.mission
      ? `~${Core.fmtTok(Core.tokens(S.mission))} tokens fast kontekst`
      : '';
  }

  function renderPrices() {
    const body = $('#priceTable tbody');
    body.innerHTML = '';
    const p = priceTable();
    Core.MODEL_IDS.forEach((id) => {
      const mk = (field) => el('input', {
        type: 'number', min: '0', step: '0.25', value: p[id][field],
        style: 'text-align:right;padding:4px 7px;font-size:0.8rem',
        oninput: (e) => {
          S.prices[id] = { ...(S.prices[id] || {}), [field]: +e.target.value };
          renderOut();
          renderPricesReadonly();
          queueSave();
        }
      });
      body.appendChild(el('tr', {}, [
        el('td', {}, [el('span', { class: 'tag ' + id, text: Core.MODELS[id].name })]),
        el('td', { class: 'num' }, [mk('in')]),
        el('td', { class: 'num' }, [mk('out')]),
        el('td', { class: 'num mono', 'data-cacheread': id, text: '$' + (p[id].in * Core.CACHE_READ_MULT).toFixed(2) })
      ]));
    });
  }

  function renderPricesReadonly() {
    const p = priceTable();
    $$('[data-cacheread]').forEach((n) => {
      n.textContent = '$' + (p[n.dataset.cacheread].in * Core.CACHE_READ_MULT).toFixed(2);
    });
  }

  function renderTasks() {
    const box = $('#taskList');
    box.innerHTML = '';
    $('#taskCount').textContent = S.tasks.length ? `${S.tasks.length} oppgaver` : '';

    if (!S.tasks.length) {
      box.appendChild(el('div', { class: 'empty', text: 'Ingen oppgaver. Hent fra Vibe Code Planner, eller legg til manuelt.' }));
      return;
    }

    S.tasks.forEach((t, i) => {
      const auto = Core.routeModel(t).model;
      const eff = modelFor(t);

      const title = el('input', {
        type: 'text', value: t.title, placeholder: 'Hva agenten skal gjøre',
        oninput: (e) => { t.title = e.target.value; renderOut(); queueSave(); }
      });

      const kindSel = el('select', {
        onchange: (e) => { t.kind = e.target.value; renderTasks(); renderOut(); queueSave(); }
      }, Object.entries(Core.TASK_KINDS).map(([id, k]) =>
        el('option', { value: id, selected: t.kind === id, text: k.label })));

      const sizeSel = el('select', {
        onchange: (e) => { t.size = e.target.value; renderTasks(); renderOut(); queueSave(); }
      }, Object.entries(Core.SIZES).map(([id, s]) =>
        el('option', { value: id, selected: t.size === id, text: s.label })));

      const modelSel = el('select', {
        title: 'Modell — «auto» følger forslaget',
        onchange: (e) => { t.model = e.target.value; renderTasks(); renderOut(); queueSave(); }
      }, [el('option', { value: 'auto', selected: t.model === 'auto', text: `auto → ${Core.MODELS[auto].short}` })]
        .concat(Core.MODEL_IDS.map((id) =>
          el('option', { value: id, selected: t.model === id, text: Core.MODELS[id].name }))));

      const depsInp = el('input', {
        type: 'text',
        value: (t.deps || []).map((d) => S.tasks.findIndex((x) => x.id === d) + 1).filter((x) => x > 0).join(','),
        placeholder: 'etter nr.',
        title: 'Avhengigheter — oppgavenummer, komma mellom',
        onchange: (e) => {
          t.deps = String(e.target.value)
            .split(/[,\s]+/)
            .map((x) => parseInt(x, 10))
            .filter((x) => x >= 1 && x <= S.tasks.length && x !== i + 1)
            .map((x) => S.tasks[x - 1].id);
          renderTasks(); renderOut(); queueSave();
        }
      });

      const riskBtn = el('button', {
        class: 'chip tiny', 'aria-pressed': String(!!t.risk), text: 'Kritisk',
        title: 'Kritisk eller vanskelig å reversere',
        onclick: () => { t.risk = !t.risk; renderTasks(); renderOut(); queueSave(); }
      });

      const a = analyseTask(t);
      const rate = +S.rate || 0;

      box.appendChild(el('div', { class: 'task' }, [
        el('div', { class: 'task-top' }, [
          el('span', { class: 'idx', text: String(i + 1).padStart(2, '0') }),
          title,
          el('span', { class: 'tag ' + eff, text: Core.MODELS[eff].short }),
          el('span', { class: 'tiny faint nowrap', text: Core.fmtMoney(a.cost, rate) }),
          el('button', {
            class: 'tiny ghost', title: 'Flytt opp', text: '↑',
            onclick: () => { if (i > 0) { [S.tasks[i - 1], S.tasks[i]] = [S.tasks[i], S.tasks[i - 1]]; renderTasks(); renderOut(); queueSave(); } }
          }),
          el('button', {
            class: 'tiny ghost', title: 'Fjern', text: '×',
            onclick: () => {
              const gone = S.tasks[i].id;
              S.tasks.splice(i, 1);
              S.tasks.forEach((x) => { x.deps = (x.deps || []).filter((d) => d !== gone); });
              renderTasks(); renderOut(); queueSave();
            }
          })
        ]),
        el('div', { class: 'task-ctl' }, [kindSel, sizeSel, modelSel, depsInp, riskBtn])
      ]));
    });
  }

  function renderStats() {
    const T = totals();
    const rate = +S.rate || 0;
    const saved = T.naive - T.cost;
    const pct = T.naive > 0 ? Math.round((saved / T.naive) * 100) : 0;
    const fill = T.peak / (+S.window || 200000);

    const stat = (k, v, s, cls = '') =>
      el('div', { class: 'stat ' + cls }, [
        el('div', { class: 'k', text: k }),
        el('div', { class: 'v', text: v }),
        s ? el('div', { class: 's', text: s }) : null
      ]);

    const box = $('#stats');
    box.innerHTML = '';
    box.append(
      stat('Kostnad', Core.fmtMoney(T.cost, rate), `inkl. ${S.overhead}% påslag`),
      stat('Alt på Opus', Core.fmtMoney(T.naive, rate), 'uten caching', 'bad'),
      stat('Spart', pct > 0 ? pct + ' %' : '—', pct > 0 ? Core.fmtMoney(saved, rate) : '—', pct > 0 ? 'good' : ''),
      stat('Tokens', Core.fmtTok(T.input + T.output), `${Core.fmtTok(T.input)} inn / ${Core.fmtTok(T.output)} ut`),
      stat('Tid', Core.fmtDur(T.wall), `${Core.fmtDur(T.serial)} sekvensielt`),
      stat('Kontekstfyll', Math.round(fill * 100) + ' %', 'på tyngste oppgave',
        fill > 0.8 ? 'bad' : fill > 0.55 ? 'warn' : 'good')
    );

    // Advarsler
    const W = $('#warnings');
    W.innerHTML = '';
    const warn = [];

    if (fill > 0.8) warn.push('Tyngste oppgave fyller over 80 % av kontekstvinduet. Del den opp, eller gi agenten et utdrag i stedet for hele kodebasen.');
    else if (fill > 0.55) warn.push('Tyngste oppgave bruker over halve kontekstvinduet. Det går, men marginen til komprimering er liten.');

    if (!S.caching && sharedTokens() > 5000) warn.push(`Caching er av, og prefikset er ${Core.fmtTok(sharedTokens())} tokens. Slår du det på, faller inn-kostnaden merkbart.`);

    const bigL = S.tasks.filter((t) => t.size === 'L');
    if (bigL.length > 2) warn.push(`${bigL.length} oppgaver er merket L. Store oppgaver sprekker oftest — del dem i M-biter før du starter.`);

    const opusN = S.tasks.filter((t) => modelFor(t) === 'opus').length;
    if (opusN > S.tasks.length * 0.5 && S.tasks.length > 3) warn.push('Over halvparten av oppgavene går på Opus. Se om noen tåler Sonnet — det er der mesteparten av pengene ligger.');

    if (!S.mission.trim() && S.tasks.length) warn.push('Ingen fast kontekst er lagt inn. Da må hver agent finne ut av prosjektet selv, og det er dyrt.');

    const wide = T.waves.filter((w) => w.items.length > +S.parallel);
    if (wide.length) warn.push(`${wide.length} bølge(r) har flere oppgaver enn taket på ${S.parallel} samtidige agenter, så de deles i puljer.`);

    warn.forEach((w) => W.appendChild(el('div', { class: 'note', style: 'margin-bottom:7px', text: w })));
  }

  function renderWaves() {
    const T = totals();
    const box = $('#waveView');
    box.innerHTML = '';
    $('#waveMeta').textContent = T.n ? `${T.waves.length} bølger · ${Core.fmtDur(T.wall)}` : '';

    if (!T.n) {
      box.appendChild(el('div', { class: 'empty', text: 'Kjøreplanen dukker opp når du har oppgaver.' }));
      return;
    }

    T.waves.forEach((w) => {
      const rows = w.items.map(({ t, a, no }) =>
        el('div', { class: 'wave-task' }, [
          el('span', { class: 'tiny faint mono', text: String(no).padStart(2, '0') }),
          el('span', { class: 't', text: t.title || 'Uten tittel' }),
          el('span', { class: 'tag ' + a.model, text: Core.MODELS[a.model].short }),
          el('span', { class: 'tiny faint nowrap', text: Core.fmtDur(a.minutes) })
        ]));

      box.appendChild(el('div', { class: 'wave' }, [
        el('div', { class: 'wave-head' }, [
          el('span', { class: 'b', text: `Bølge ${w.no}` }),
          el('span', { text: `${w.items.length} oppgave${w.items.length === 1 ? '' : 'r'}` }),
          w.batches > 1 ? el('span', { text: `· ${w.batches} puljer` }) : null,
          el('span', { style: 'margin-left:auto', text: Core.fmtDur(w.minutes) })
        ]),
        el('div', { class: 'wave-tasks' }, rows),
        S.checkpoints ? el('div', { class: 'tiny faint', style: 'margin-top:6px', text: '⏸ godkjenning før neste bølge' }) : null
      ]));
    });
  }

  function renderCostTable() {
    const T = totals();
    const rate = +S.rate || 0;
    const body = $('#costTable tbody');
    const foot = $('#costTable tfoot');
    body.innerHTML = '';
    foot.innerHTML = '';

    Core.MODEL_IDS.forEach((id) => {
      const r = T.per[id];
      if (!r.n) return;
      body.appendChild(el('tr', {}, [
        el('td', {}, [el('span', { class: 'tag ' + id, text: Core.MODELS[id].name })]),
        el('td', { class: 'num', text: String(r.n) }),
        el('td', { class: 'num', text: Core.fmtTok(r.input) }),
        el('td', { class: 'num', text: Core.fmtTok(r.output) }),
        el('td', { class: 'num', text: Core.fmtMoney(r.cost, rate) })
      ]));
    });

    if (!body.children.length) {
      body.appendChild(el('tr', {}, [el('td', { colspan: '5', class: 'faint small', text: 'Ingen oppgaver ennå.' })]));
      return;
    }

    foot.appendChild(el('tr', {}, [
      el('td', { text: 'Sum' }),
      el('td', { class: 'num', text: String(T.n) }),
      el('td', { class: 'num', text: Core.fmtTok(T.input) }),
      el('td', { class: 'num', text: Core.fmtTok(T.output) }),
      el('td', { class: 'num', text: Core.fmtMoney(T.cost, rate) })
    ]));
  }

  function renderOut() {
    for (const [name, o] of Object.entries(OUTPUTS)) {
      const node = $('#out-' + name);
      if (node) node.textContent = o.md();
    }
    const md = OUTPUTS[activeTab].md();
    $('#outMeta').textContent = `${OUTPUTS[activeTab].file} · ${Core.fmtNum(md.length)} tegn · ~${Core.fmtTok(Core.tokens(md))} tokens`;
    renderStats();
    renderWaves();
    renderCostTable();
    $('#missionSize').textContent = S.mission ? `~${Core.fmtTok(Core.tokens(S.mission))} tokens fast kontekst` : '';
  }

  let saveTimer;
  function queueSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 400);
  }

  function renderAll() {
    renderFields();
    renderPrices();
    renderTasks();
    renderOut();
  }

  /* ---------- Hendelser ---------- */

  document.addEventListener('input', (e) => {
    const n = e.target.closest('[data-f]');
    if (!n) return;
    S[n.dataset.f] = n.type === 'number' ? +n.value : n.value;
    renderOut();
    queueSave();
  });

  $('[data-f="repo"]').addEventListener('change', () => { S.repo = +$('[data-f="repo"]').value; renderOut(); queueSave(); });

  $$('[data-toggle]').forEach((b) =>
    b.addEventListener('click', () => {
      S[b.dataset.toggle] = !S[b.dataset.toggle];
      renderFields();
      renderTasks();
      renderOut();
      queueSave();
    }));

  $('#addTask').addEventListener('click', () => {
    S.tasks.push(newTask());
    renderTasks();
    renderOut();
    queueSave();
    const inputs = $$('#taskList .task-top input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });

  $('#autoDeps').addEventListener('click', () => {
    // Oppsett først, så alt annet, med gjennomgang/tester/dokumentasjon til slutt.
    const early = ['setup', 'research', 'architecture'];
    const late = ['test', 'review', 'docs'];
    const heads = S.tasks.filter((t) => early.includes(t.kind));
    const mids = S.tasks.filter((t) => !early.includes(t.kind) && !late.includes(t.kind));
    const tails = S.tasks.filter((t) => late.includes(t.kind));

    heads.forEach((t, i) => { t.deps = i ? [heads[i - 1].id] : []; });
    const base = heads.length ? [heads[heads.length - 1].id] : [];
    mids.forEach((t) => { t.deps = base.slice(); });
    const after = mids.length ? mids.map((t) => t.id) : base;
    tails.forEach((t) => { t.deps = after.slice(); });

    renderTasks();
    renderOut();
    queueSave();
    Core.toast('Avhengigheter koblet');
  });

  Core.initTabs($('#outTabs').parentElement, (name) => {
    activeTab = name;
    const md = OUTPUTS[name].md();
    $('#outMeta').textContent = `${OUTPUTS[name].file} · ${Core.fmtNum(md.length)} tegn · ~${Core.fmtTok(Core.tokens(md))} tokens`;
  });

  $('#copyOut').addEventListener('click', () => Core.copy(OUTPUTS[activeTab].md()));
  $('#dlOut').addEventListener('click', () => {
    const o = OUTPUTS[activeTab];
    Core.download(o.file, o.md(), o.type);
  });
  $('#dlJson').addEventListener('click', () =>
    Core.download(Core.slug(S.name || 'agent-run') + '-run.json', JSON.stringify(S, null, 2), 'application/json'));

  $('#importJson').addEventListener('click', () =>
    Core.pickFile('.json,application/json', (txt) => {
      try {
        const obj = JSON.parse(txt);
        S = { ...blank(), ...obj };
        if (!Array.isArray(S.tasks)) S.tasks = [];
        S.tasks = S.tasks.map((t) => newTask(t));
        save();
        renderAll();
        Core.toast('Lastet inn');
      } catch {
        Core.toast('Ugyldig JSON-fil');
      }
    }));

  $('#resetAll').addEventListener('click', () => {
    if (!confirm('Nullstille alt i Agent Run Planner?')) return;
    S = blank();
    save();
    renderAll();
  });

  function pullHandoff(quiet) {
    const h = Core.store.load(HANDOFF, null);
    if (!h || !h.tasks) {
      if (!quiet) Core.toast('Fant ingen plan — lag en i Vibe Code Planner først');
      return false;
    }
    S.name = h.name || S.name;
    S.mission = (h.brief || '').trim();
    S.notList = h.notList || [];
    S.done = h.done || [];
    S.tasks = h.tasks.map((t) => newTask({
      id: t.id, title: t.title, kind: t.kind, size: t.size,
      risk: !!t.risk, vague: !!t.vague, deps: t.deps || [], model: 'auto'
    }));
    save();
    renderAll();
    Core.toast(`Hentet ${S.tasks.length} oppgaver`);
    return true;
  }

  $('#importHandoff').addEventListener('click', () => pullHandoff(false));

  $('#loadExample').addEventListener('click', () => {
    S = {
      ...blank(),
      name: 'Vibe-kort — første bygg',
      mission: 'Vibe-kort: en webapp der brukeren lager digitale kort med tittel, tekst og bakgrunnsfarge, og deler dem med en lenke.\n\nStack: vanilla HTML/CSS/JS, ingen byggesteg, publiseres på GitHub Pages.\nRegler: ingen rammeverk, norsk i grensesnittet, engelsk i koden, alt lagres lokalt i nettleseren.',
      repo: 8000,
      notList: ['Innlogging', 'Database eller server', 'Betaling'],
      done: ['Kort overlever oppfriskning av siden', 'Delingslenken virker for andre', 'Ser riktig ut på mobil'],
      tasks: [
        newTask({ title: 'Prosjektskjelett og filstruktur', kind: 'setup', size: 'S' }),
        newTask({ title: 'Datamodell og lagring i nettleseren', kind: 'implement', size: 'M' }),
        newTask({ title: 'Grunnlayout, navigasjon og stil', kind: 'ui', size: 'M' }),
        newTask({ title: 'Lage og redigere et kort', kind: 'implement', size: 'M' }),
        newTask({ title: 'Oversikt over alle kortene', kind: 'ui', size: 'M' }),
        newTask({ title: 'Deling via lenke med kortet kodet i URL-en', kind: 'implement', size: 'L', risk: true }),
        newTask({ title: 'Responsivt og tastaturvennlig', kind: 'ui', size: 'S' }),
        newTask({ title: 'Tester for kjernelogikken', kind: 'test', size: 'M' }),
        newTask({ title: 'README og publisering', kind: 'docs', size: 'S' })
      ]
    };
    $('#autoDeps').click();
    save();
    renderAll();
    Core.toast('Eksempel lastet');
  });

  /* ---------- Start ---------- */

  Core.initTheme();
  if (new URLSearchParams(location.search).get('import') === '1') {
    pullHandoff(true);
    // Flagget skal virke én gang. Ellers overskriver en refresh alt du har gjort siden.
    try { history.replaceState(null, '', location.pathname); } catch { /* ignorer */ }
  }
  renderAll();
})();
