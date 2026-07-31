/* Vibe Code Planner — idé inn, byggbar brief ut. */

(() => {
  const { $, $$, el } = Core;
  const KEY = 'vibeplanner.v2';
  const HANDOFF = 'planner.handoff';

  /* ---------- Tilstand ---------- */

  const blank = () => ({
    name: '',
    pitch: '',
    type: 'webapp',
    stack: '',
    deploy: '',
    ambition: 'real',
    must: ['', '', ''],
    should: [''],
    not: ['Innlogging og brukerkontoer', 'Database eller server'],
    existing: 'new',
    files: '',
    rules: '',
    run: '',
    test: '',
    done: '',
    tasks: [],
    roundsUn: 7,
    roundsPl: 3,
    ctx: 9000,
    rate: 10.5
  });

  let S = Core.store.load(KEY, blank());
  if (!Array.isArray(S.tasks)) S.tasks = [];

  const save = () => Core.store.save(KEY, S);

  /* ---------- Forslag ---------- */

  const STACK_HINT = {
    webapp: 'Vanilla HTML/CSS/JS, ingen byggesteg',
    static: 'Vanilla HTML/CSS, ingen byggesteg',
    api: 'Node + Express',
    fullstack: 'Node + Express, vanilla frontend',
    cli: 'Node, ingen avhengigheter',
    script: 'Python 3',
    prototype: 'Én HTML-fil',
    content: 'Markdown-filer'
  };

  const DEPLOY_HINT = {
    webapp: 'GitHub Pages', static: 'GitHub Pages', api: 'lokalt / enkel VPS',
    fullstack: 'lokalt', cli: 'lokalt (npx)', script: 'lokalt',
    prototype: 'åpnes som fil', content: 'i repoet'
  };

  const RUN_HINT = {
    webapp: 'åpne index.html', static: 'åpne index.html', api: 'npm start',
    fullstack: 'npm run dev', cli: 'node cli.js', script: 'python main.py',
    prototype: 'åpne index.html', content: '—'
  };

  // Grunnoppgaver per prosjekttype. group styrer avhengigheter og bølger.
  const TEMPLATES = {
    webapp: {
      foundation: [
        ['Prosjektskjelett og filstruktur', 'setup', 'S'],
        ['Datamodell og tilstandshåndtering', 'implement', 'M'],
        ['Grunnlayout, navigasjon og stil', 'ui', 'M']
      ],
      final: [
        ['Lagring som overlever oppfriskning', 'implement', 'M'],
        ['Responsivt og tastaturvennlig', 'ui', 'S'],
        ['Tester for kjernelogikken', 'test', 'M'],
        ['README og publisering', 'docs', 'S']
      ]
    },
    static: {
      foundation: [
        ['Sideskjelett og designsystem', 'setup', 'S'],
        ['Seksjoner og innholdsstruktur', 'ui', 'M']
      ],
      final: [
        ['Responsivt og tilgjengelig', 'ui', 'S'],
        ['README og publisering', 'docs', 'S']
      ]
    },
    api: {
      foundation: [
        ['Serverskjelett og ruting', 'setup', 'S'],
        ['Datamodell og skjema', 'implement', 'M']
      ],
      final: [
        ['Validering og feilhåndtering', 'implement', 'M'],
        ['Tester for endepunktene', 'test', 'M'],
        ['API-dokumentasjon', 'docs', 'S']
      ]
    },
    fullstack: {
      foundation: [
        ['Prosjektskjelett, klient og server', 'setup', 'M'],
        ['Datamodell delt mellom klient og server', 'architecture', 'M'],
        ['Grunnlayout og ruting i klienten', 'ui', 'M']
      ],
      final: [
        ['Validering og feilhåndtering', 'implement', 'M'],
        ['Tester for kjernelogikken', 'test', 'M'],
        ['README og oppsett', 'docs', 'S']
      ]
    },
    cli: {
      foundation: [
        ['CLI-skjelett og argumenthåndtering', 'setup', 'S'],
        ['Kjernekommandoen', 'implement', 'M']
      ],
      final: [
        ['Utdataformat og feilmeldinger', 'ui', 'S'],
        ['Tester', 'test', 'M'],
        ['README med eksempler', 'docs', 'S']
      ]
    },
    script: {
      foundation: [['Skjelett og inn-/utdata', 'setup', 'S']],
      final: [
        ['Feilhåndtering og logging', 'implement', 'S'],
        ['README med kjøreeksempel', 'docs', 'S']
      ]
    },
    prototype: {
      foundation: [['Én fil som kjører, med dummydata', 'setup', 'S']],
      final: [['Finpuss så det er demobart', 'ui', 'S']]
    },
    content: {
      foundation: [['Disposisjon og struktur', 'architecture', 'M']],
      final: [['Gjennomlesning og stramming', 'content', 'M']]
    }
  };

  const isBig = (t) => t.length > 55 || /\b(og|samt|pluss)\b/i.test(t);

  function featureKind(text) {
    const t = text.toLowerCase();
    if (/(vis|design|layout|utseende|farge|animasjon|skjerm|side|knapp)/.test(t)) return 'ui';
    if (/(tekst|innhold|kopi|beskrivelse)/.test(t)) return 'content';
    if (/(eksport|import|lagre|last|api|hent|synk|integrasjon)/.test(t)) return 'implement';
    return 'implement';
  }

  function generateTasks() {
    const tpl = TEMPLATES[S.type] || TEMPLATES.webapp;
    const locked = S.tasks.filter((t) => t.locked);
    const out = [];
    const add = (title, kind, size, group, extra = {}) =>
      out.push({ id: Core.uid(), title, kind, size, group, risk: false, vague: false, locked: false, ...extra });

    if (S.existing === 'big') add('Kartlegg eksisterende kode og konvensjoner', 'research', 'M', 'foundation');
    else if (S.existing === 'some') add('Les gjennom det som finnes fra før', 'research', 'S', 'foundation');

    tpl.foundation.forEach(([t, k, s]) => add(t, k, s, 'foundation'));

    Core.lines(S.must.join('\n')).forEach((m) =>
      add(m, featureKind(m), isBig(m) ? 'L' : 'M', 'feature')
    );

    tpl.final.forEach(([t, k, s]) => {
      if (S.ambition === 'throwaway' && (k === 'test' || k === 'docs')) return;
      add(t, k, s, 'final');
    });

    if (S.ambition === 'polished') {
      add('Finpuss: tomme tilstander, feilmeldinger, detaljer', 'ui', 'M', 'final');
      add('Gjennomgang av hele koden før levering', 'review', 'M', 'final', { risk: true });
    }

    // Låste oppgaver overlever regenerering.
    S.tasks = locked.concat(out.filter((t) => !locked.some((l) => l.title === t.title)));
    linkDeps();
  }

  /** Fundamentet går i kjede, funksjoner parallelt, sluttoppgaver etter alt. */
  function linkDeps() {
    const found = S.tasks.filter((t) => t.group === 'foundation');
    const feats = S.tasks.filter((t) => t.group === 'feature');
    const fin = S.tasks.filter((t) => t.group === 'final');

    found.forEach((t, i) => { t.deps = i ? [found[i - 1].id] : []; });
    const base = found.length ? [found[found.length - 1].id] : [];
    feats.forEach((t) => { t.deps = base.slice(); });
    const afterFeats = feats.length ? feats.map((t) => t.id) : base;
    fin.forEach((t) => { t.deps = afterFeats.slice(); });
  }

  /* ---------- Beregning ---------- */

  function derived() {
    const stack = S.stack || STACK_HINT[S.type] || '';
    const deploy = S.deploy || DEPLOY_HINT[S.type] || '';
    const run = S.run || RUN_HINT[S.type] || '';
    const must = Core.lines(S.must.join('\n'));
    const should = Core.lines(S.should.join('\n'));
    const not = Core.lines(S.not.join('\n'));
    const files = Core.lines(S.files);
    const rules = Core.lines(S.rules);
    const done = Core.lines(S.done);
    const name = S.name || 'Uten navn';
    return { stack, deploy, run, must, should, not, files, rules, done, name };
  }

  function econ(briefTokens) {
    const n = Math.max(S.tasks.length, 1);
    const ctx = +S.ctx || 9000;
    const rU = +S.roundsUn || 7;
    const rP = +S.roundsPl || 3;
    const price = Core.prices();

    let planIn = 0, planOut = 0, planCost = 0, minutes = 0;
    const perModel = { haiku: 0, sonnet: 0, opus: 0 };

    for (const t of S.tasks) {
      const { model } = Core.routeModel(t);
      const size = Core.SIZES[t.size] || Core.SIZES.M;
      const kind = Core.TASK_KINDS[t.kind] || Core.TASK_KINDS.implement;
      const out = Math.round(size.tokens * kind.outRatio);
      // Første runde leser briefen fersk, resten treffer cachen.
      const fresh = ctx;
      const cacheWrite = briefTokens;
      const cacheRead = briefTokens * (rP - 1) + ctx * (rP - 1);

      planIn += fresh + cacheWrite + cacheRead;
      planOut += out;
      planCost += Core.cost({ model, input: fresh, output: out, cacheWrite, cacheRead }, price);
      minutes += Core.taskMinutes(t, model);
      perModel[model]++;
    }

    // Uten plan: alt på den største modellen, flere runder, ingen cache,
    // og en andel arbeid som må gjøres om igjen.
    let naiveIn = 0, naiveOut = 0, naiveCost = 0, naiveMin = 0;
    for (const t of S.tasks) {
      const size = Core.SIZES[t.size] || Core.SIZES.M;
      const kind = Core.TASK_KINDS[t.kind] || Core.TASK_KINDS.implement;
      const inTok = ctx * rU;
      const outTok = Math.round(size.tokens * kind.outRatio * 1.6);
      naiveIn += inTok;
      naiveOut += outTok;
      naiveCost += Core.cost({ model: 'opus', input: inTok, output: outTok }, price);
      naiveMin += Core.taskMinutes({ ...t, rounds: rU }, 'opus');
    }

    const w = Core.waves(S.tasks);
    const wallclock = w.reduce((acc, wave) => {
      const longest = Math.max(...wave.map((t) => Core.taskMinutes(t, Core.routeModel(t).model)), 0);
      return acc + longest;
    }, 0);

    return {
      n, planIn, planOut, planCost, minutes, perModel,
      naiveIn, naiveOut, naiveCost, naiveMin, waves: w, wallclock,
      savedTok: naiveIn + naiveOut - (planIn + planOut),
      savedCost: naiveCost - planCost
    };
  }

  /* ---------- Markdown ---------- */

  function mdBrief() {
    const d = derived();
    const L = [];
    L.push(`# ${d.name}`, '');
    if (S.pitch) L.push(S.pitch.trim(), '');
    L.push(`**Stack:** ${d.stack || 'ikke bestemt'}  `);
    L.push(`**Kjører på:** ${d.deploy || 'ikke bestemt'}  `);
    L.push(`**Utgangspunkt:** ${{ new: 'tomt repo', some: 'noen filer finnes', big: 'eksisterende kodebase' }[S.existing]}`);
    L.push('');

    if (d.must.length) L.push('## Må ha', Core.bullets(d.must), '');
    if (d.should.length) L.push('## Kjekt å ha', '_Bare når alt over står._', Core.bullets(d.should), '');

    L.push('## Ikke bygg dette');
    L.push(d.not.length ? Core.bullets(d.not) : '- _(ingen begrensninger oppgitt)_');
    L.push('');

    if (d.rules.length) L.push('## Regler', Core.bullets(d.rules), '');

    if (d.done.length) {
      L.push('## Ferdig når', d.done.map((x) => `- [ ] ${x}`).join('\n'), '');
    }

    if (d.files.length) L.push('## Les disse først', Core.bullets(d.files), '');

    const cmds = [];
    if (d.run) cmds.push(`- Kjør: \`${d.run}\``);
    if (S.test) cmds.push(`- Test: \`${S.test}\``);
    if (cmds.length) L.push('## Kommandoer', cmds.join('\n'), '');

    return L.join('\n').trim() + '\n';
  }

  function mdClaude() {
    const d = derived();
    const L = [];
    L.push(`# ${d.name}`, '');
    if (S.pitch) L.push(S.pitch.trim(), '');
    L.push('## Stack', `- ${d.stack || 'ikke bestemt'}`, `- Kjører på: ${d.deploy || 'ikke bestemt'}`, '');

    if (d.rules.length) L.push('## Konvensjoner', Core.bullets(d.rules), '');

    const cmds = [];
    if (d.run) cmds.push(`- Kjør: \`${d.run}\``);
    if (S.test) cmds.push(`- Test: \`${S.test}\``);
    if (cmds.length) L.push('## Kommandoer', cmds.join('\n'), '');

    if (d.files.length) L.push('## Viktige filer', Core.bullets(d.files), '');

    if (d.not.length) L.push('## Utenfor omfang', '_Ikke bygg dette uten at jeg ber om det._', Core.bullets(d.not), '');

    L.push('## Arbeidsmåte',
      '- Én oppgave om gangen. Stopp når den er ferdig, ikke fortsett til neste.',
      '- Les de viktige filene før du endrer dem.',
      '- Ingen nye avhengigheter uten at du spør først.',
      '- Er noe uklart: still ett spørsmål, ikke gjett bredt.',
      '- Oppsummer endringer i maks fem linjer.',
      '');

    return L.join('\n').trim() + '\n';
  }

  function mdPlan() {
    const d = derived();
    const e = econ(Core.tokens(mdBrief() + mdClaude()));
    const L = [];
    L.push(`# Plan — ${d.name}`, '');
    L.push(`${e.n} oppgaver i ${e.waves.length} bølger. Anslag: ${Core.fmtTok(e.planIn + e.planOut)} tokens, ${Core.fmtDur(e.minutes)} agent-arbeid.`, '');

    e.waves.forEach((wave, i) => {
      L.push(`## Bølge ${i + 1}${wave.length > 1 ? ` — ${wave.length} oppgaver kan gå parallelt` : ''}`, '');
      wave.forEach((t) => {
        const { model } = Core.routeModel(t);
        const kind = Core.TASK_KINDS[t.kind] || Core.TASK_KINDS.implement;
        L.push(`- **${t.title}**  `);
        L.push(`  ${kind.label} · ${t.size} · foreslått ${Core.MODELS[model].name}${t.risk ? ' · kritisk' : ''}`);
      });
      L.push('');
    });

    if (d.done.length) L.push('## Akseptansekriterier', d.done.map((x) => `- [ ] ${x}`).join('\n'), '');
    return L.join('\n').trim() + '\n';
  }

  function mdFirst() {
    const d = derived();
    const first = S.tasks[0];
    const L = [];
    L.push('Les hele denne meldingen før du skriver kode. Ikke start på noe som ikke står her.', '');
    L.push('---', '');
    L.push(mdBrief().trim(), '');
    L.push('---', '');
    L.push('## Din oppgave nå', '');
    if (first) {
      const kind = Core.TASK_KINDS[first.kind] || Core.TASK_KINDS.implement;
      L.push(`**${first.title}**`, '');
      L.push(`Type arbeid: ${kind.label}. Omfang: ${first.size === 'S' ? 'lite — hold det kort' : first.size === 'L' ? 'stort — del det opp selv om du må' : 'middels'}.`, '');
    } else {
      L.push('_Legg til oppgaver i planleggeren for å fylle ut dette._', '');
    }
    L.push('Bare denne ene oppgaven. Ikke bygg videre på egen hånd.', '');
    L.push('## Slik vil jeg ha det',
      '- Er noe uklart: still ett konkret spørsmål før du koder. Ikke gjett deg gjennom.',
      '- Ingen nye avhengigheter uten at du spør.',
      '- Ikke rør ting utenfor omfanget over.',
      '- Når du er ferdig: stopp, og oppsummer i maks fem linjer hva du endret og hva jeg bør sjekke.',
      '');
    if (S.tasks.length > 1) {
      L.push(`Etterpå står ${S.tasks.length - 1} oppgaver igjen. Jeg gir deg dem én om gangen.`);
    }
    return L.join('\n').trim() + '\n';
  }

  const OUTPUTS = {
    brief: { md: mdBrief, file: 'BRIEF.md' },
    claude: { md: mdClaude, file: 'CLAUDE.md' },
    plan: { md: mdPlan, file: 'PLAN.md' },
    first: { md: mdFirst, file: 'forste-prompt.md' }
  };

  let activeTab = 'brief';

  /* ---------- Rendering ---------- */

  function renderFields() {
    $$('[data-f]').forEach((n) => {
      const k = n.dataset.f;
      if (Array.isArray(S[k])) return;
      if (S[k] !== undefined && S[k] !== null) n.value = S[k];
    });
    ['stack', 'deploy', 'run'].forEach((k) => {
      const n = $(`[data-f="${k}"]`);
      if (!n) return;
      const hint = { stack: STACK_HINT, deploy: DEPLOY_HINT, run: RUN_HINT }[k][S.type];
      if (hint) n.placeholder = hint;
    });
  }

  function renderList(key) {
    const box = $('#list-' + key);
    if (!box) return;
    box.innerHTML = '';
    if (!S[key].length) S[key] = [''];

    S[key].forEach((val, i) => {
      const input = el('input', {
        type: 'text',
        value: val,
        placeholder: { must: 'Kan lage et nytt kort', should: 'Mørk modus', not: 'Innlogging' }[key],
        oninput: (e) => { S[key][i] = e.target.value; touch(); },
        onkeydown: (e) => {
          if (e.key === 'Enter') { e.preventDefault(); S[key].splice(i + 1, 0, ''); renderList(key); focusList(key, i + 1); touch(); }
          if (e.key === 'Backspace' && !e.target.value && S[key].length > 1) {
            e.preventDefault(); S[key].splice(i, 1); renderList(key); focusList(key, Math.max(0, i - 1)); touch();
          }
        }
      });
      const row = el('div', { class: 'list-item' }, [
        el('span', { class: 'drag', text: '•' }),
        input,
        el('button', {
          class: 'tiny ghost', title: 'Fjern', text: '×',
          onclick: () => { S[key].splice(i, 1); if (!S[key].length) S[key] = ['']; renderList(key); touch(); }
        })
      ]);
      box.appendChild(row);
    });
  }

  const focusList = (key, i) => {
    const n = $$(`#list-${key} input`)[i];
    if (n) n.focus();
  };

  function renderTasks() {
    const box = $('#taskList');
    box.innerHTML = '';
    $('#taskCount').textContent = S.tasks.length ? `${S.tasks.length} oppgaver` : '';

    if (!S.tasks.length) {
      box.appendChild(el('div', { class: 'empty', text: 'Ingen oppgaver ennå — trykk «Foreslå oppgaver på nytt».' }));
      return;
    }

    S.tasks.forEach((t, i) => {
      const { model } = Core.routeModel(t);

      const title = el('input', {
        type: 'text', value: t.title, placeholder: 'Hva skal gjøres',
        oninput: (e) => { t.title = e.target.value; touch(); }
      });

      const kindSel = el('select', {
        onchange: (e) => { t.kind = e.target.value; renderTasks(); touch(); }
      }, Object.entries(Core.TASK_KINDS).map(([id, k]) =>
        el('option', { value: id, selected: t.kind === id, text: k.label })));

      const sizeSel = el('select', {
        onchange: (e) => { t.size = e.target.value; renderTasks(); touch(); }
      }, Object.entries(Core.SIZES).map(([id, s]) =>
        el('option', { value: id, selected: t.size === id, text: s.label })));

      const riskBtn = el('button', {
        class: 'chip tiny', 'aria-pressed': String(!!t.risk),
        title: 'Kritisk eller vanskelig å reversere — løftes til sterkere modell',
        text: 'Kritisk',
        onclick: () => { t.risk = !t.risk; renderTasks(); touch(); }
      });

      const vagueBtn = el('button', {
        class: 'chip tiny', 'aria-pressed': String(!!t.vague),
        title: 'Uklar spec — trenger mer resonnering',
        text: 'Uklar',
        onclick: () => { t.vague = !t.vague; renderTasks(); touch(); }
      });

      const card = el('div', { class: 'task' + (t.locked ? ' locked' : '') }, [
        el('div', { class: 'task-top' }, [
          el('span', { class: 'idx', text: String(i + 1).padStart(2, '0') }),
          title,
          el('span', { class: 'tag ' + model, text: Core.MODELS[model].short }),
          el('button', {
            class: 'tiny ghost', title: t.locked ? 'Låst — beholdes ved regenerering' : 'Lås oppgaven',
            text: t.locked ? '🔒' : '🔓',
            onclick: () => { t.locked = !t.locked; renderTasks(); touch(); }
          }),
          el('button', {
            class: 'tiny ghost', title: 'Fjern', text: '×',
            onclick: () => { S.tasks.splice(i, 1); linkDeps(); renderTasks(); touch(); }
          })
        ]),
        el('div', { class: 'task-ctl' }, [kindSel, sizeSel, riskBtn, vagueBtn])
      ]);
      box.appendChild(card);
    });
  }

  function renderEcon() {
    const briefTok = Core.tokens(mdBrief() + mdClaude());
    const e = econ(briefTok);
    const rate = +S.rate || 0;
    const pct = e.naiveIn + e.naiveOut > 0
      ? Math.round((e.savedTok / (e.naiveIn + e.naiveOut)) * 100) : 0;

    const stat = (k, v, s, cls = '') =>
      el('div', { class: 'stat ' + cls }, [
        el('div', { class: 'k', text: k }),
        el('div', { class: 'v', text: v }),
        s ? el('div', { class: 's', text: s }) : null
      ]);

    const box = $('#econ');
    box.innerHTML = '';
    box.append(
      stat('Brief', Core.fmtTok(briefTok), 'tokens å sende én gang'),
      stat('Uten plan', Core.fmtTok(e.naiveIn + e.naiveOut), Core.fmtMoney(e.naiveCost, rate), 'bad'),
      stat('Med plan', Core.fmtTok(e.planIn + e.planOut), Core.fmtMoney(e.planCost, rate), 'good'),
      stat('Spart', pct > 0 ? pct + ' %' : '—', pct > 0 ? Core.fmtMoney(e.savedCost, rate) + ' mindre' : 'legg til oppgaver', pct > 0 ? 'good' : ''),
      stat('Bølger', String(e.waves.length), `${e.n} oppgaver`),
      stat('Agent-tid', Core.fmtDur(e.wallclock), 'ved parallell kjøring')
    );
  }

  function renderOut() {
    for (const [name, o] of Object.entries(OUTPUTS)) {
      const node = $('#out-' + name);
      if (node) node.textContent = o.md();
    }
    const md = OUTPUTS[activeTab].md();
    $('#outMeta').textContent = `${OUTPUTS[activeTab].file} · ${Core.fmtNum(md.length)} tegn · ~${Core.fmtTok(Core.tokens(md))} tokens`;
    renderEcon();
  }

  let saveTimer;
  function touch() {
    renderOut();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 400);
  }

  function renderAll() {
    renderFields();
    ['must', 'should', 'not'].forEach(renderList);
    renderTasks();
    renderOut();
  }

  /* ---------- Hendelser ---------- */

  document.addEventListener('input', (e) => {
    const n = e.target.closest('[data-f]');
    if (!n || Array.isArray(S[n.dataset.f])) return;
    const k = n.dataset.f;
    S[k] = n.type === 'number' ? +n.value : n.value;
    touch();
  });

  $('[data-f="type"]').addEventListener('change', () => { renderFields(); touch(); });
  $('[data-f="existing"]').addEventListener('change', touch);
  $('[data-f="ambition"]').addEventListener('change', touch);

  $$('[data-add]').forEach((b) =>
    b.addEventListener('click', () => {
      const k = b.dataset.add;
      S[k].push('');
      renderList(k);
      focusList(k, S[k].length - 1);
      touch();
    }));

  $('#genTasks').addEventListener('click', () => {
    generateTasks();
    renderTasks();
    touch();
    Core.toast(`${S.tasks.length} oppgaver foreslått`);
  });

  $('#addTask').addEventListener('click', () => {
    S.tasks.push({ id: Core.uid(), title: '', kind: 'implement', size: 'M', group: 'feature', risk: false, vague: false, locked: true, deps: [] });
    linkDeps();
    renderTasks();
    touch();
    const inputs = $$('#taskList .task-top input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });

  Core.initTabs($('#outTabs').parentElement, (name) => {
    activeTab = name;
    const md = OUTPUTS[name].md();
    $('#outMeta').textContent = `${OUTPUTS[name].file} · ${Core.fmtNum(md.length)} tegn · ~${Core.fmtTok(Core.tokens(md))} tokens`;
  });

  $('#copyOut').addEventListener('click', () => Core.copy(OUTPUTS[activeTab].md()));
  $('#dlOut').addEventListener('click', () => Core.download(OUTPUTS[activeTab].file, OUTPUTS[activeTab].md()));

  $('#dlJson').addEventListener('click', () =>
    Core.download(Core.slug(S.name) + '-plan.json', JSON.stringify(S, null, 2), 'application/json'));

  $('#importJson').addEventListener('click', () =>
    Core.pickFile('.json,application/json', (txt) => {
      try {
        const obj = JSON.parse(txt);
        S = { ...blank(), ...obj };
        if (!Array.isArray(S.tasks)) S.tasks = [];
        save();
        renderAll();
        Core.toast('Lastet inn');
      } catch {
        Core.toast('Ugyldig JSON-fil');
      }
    }));

  $('#resetAll').addEventListener('click', () => {
    if (!confirm('Nullstille alt i Vibe Code Planner?')) return;
    S = blank();
    save();
    renderAll();
  });

  $('#toAgent').addEventListener('click', () => {
    if (!S.tasks.length) generateTasks();
    const d = derived();
    Core.store.save(HANDOFF, {
      from: 'vibe',
      at: Date.now(),
      mission: S.pitch || d.name,
      name: d.name,
      brief: mdBrief(),
      claude: mdClaude(),
      notList: d.not,
      done: d.done,
      tasks: S.tasks.map((t) => ({
        id: t.id, title: t.title, kind: t.kind, size: t.size,
        risk: !!t.risk, vague: !!t.vague, deps: t.deps || [], group: t.group
      }))
    });
    save();
    location.href = 'agent-planner.html?import=1';
  });

  $('#loadExample').addEventListener('click', () => {
    S = {
      ...blank(),
      name: 'Vibe-kort',
      pitch: 'En webapp der jeg lager digitale kort med tekst, farge og bilde, og deler dem med en lenke.',
      type: 'webapp',
      stack: 'Vanilla HTML/CSS/JS, ingen byggesteg',
      deploy: 'GitHub Pages',
      ambition: 'polished',
      must: ['Lage et kort med tittel, tekst og bakgrunnsfarge', 'Se alle kortene mine i en oversikt', 'Dele et kort med en lenke som virker for andre'],
      should: ['Legge inn bilde på kortet', 'Mørk modus'],
      not: ['Innlogging og brukerkontoer', 'Database eller server', 'Betaling', 'Mobilapp'],
      existing: 'new',
      files: '',
      rules: 'Ingen rammeverk og ingen byggesteg\nNorsk i grensesnittet, engelsk i koden\nAlt lagres lokalt i nettleseren',
      run: 'åpne index.html',
      test: '',
      done: 'Jeg kan lage et kort, laste siden på nytt, og kortet er fortsatt der\nDelingslenken åpner kortet hos noen andre uten at de logger inn\nSiden ser riktig ut på mobil'
    };
    generateTasks();
    save();
    renderAll();
    Core.toast('Eksempel lastet');
  });

  /* ---------- Start ---------- */

  Core.initTheme();
  if (!S.tasks.length && S.must.some((m) => m.trim())) generateTasks();
  renderAll();
})();
