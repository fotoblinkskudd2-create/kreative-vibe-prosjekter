/* Pusterom – rolig pusteøvelse (4 inn, 2 hold, 6 ut) + noen korte øvelser. */

import { el, clear } from '../dom.js';

const PHASES = [
  { key: 'inn', text: 'Pust inn…', seconds: 4, scale: 1 },
  { key: 'hold', text: 'Hold…', seconds: 2, scale: 1 },
  { key: 'ut', text: 'Pust ut…', seconds: 6, scale: 0.62 }
];

const ROUNDS = 5;

const EXERCISES = [
  {
    id: 'grounding',
    title: '5-4-3-2-1',
    blurb: 'Finn veien tilbake til rommet du er i',
    steps: [
      'Se deg rolig rundt og legg merke til 5 ting du kan se.',
      'Kjenn etter 4 ting du kan ta på. Stoffet på genseren, stolen, gulvet.',
      'Lytt etter 3 lyder. De trenger ikke være fine – bare der.',
      'Legg merke til 2 ting du kan lukte, eller to lukter du liker.',
      'Til slutt: 1 ting du kan smake, eller én ting du er glad for akkurat nå.',
      'Du er her. Det holder.'
    ]
  },
  {
    id: 'kroppsskanning',
    title: 'Kort kroppsskanning',
    blurb: 'Gå rolig gjennom kroppen på et par minutter',
    steps: [
      'Sett eller legg deg godt til rette. Lukk øynene hvis det kjennes greit.',
      'Kjenn føttene. Hvordan hviler de mot gulvet eller underlaget?',
      'Flytt oppmerksomheten til bena og hoftene. Slipp litt hvis du holder igjen.',
      'Kjenn magen og brystet bevege seg med pusten. Ikke styr den – bare følg med.',
      'Kjenn skuldrene. La dem synke et lite stykke ned.',
      'Kjenn kjeven og ansiktet. Løsne litt på tennene.',
      'Ta et siste rolig pust og kjenn hele kroppen samlet.'
    ]
  },
  {
    id: 'stille',
    title: 'Sitte stille i 60 sekunder',
    blurb: 'Ett minutt der du ikke skal noe',
    timer: 60,
    steps: [
      'Sett deg godt til rette. Du trenger ikke gjøre noe med tankene som kommer.',
      'La minuttet gå. Det er lov å bare være.'
    ]
  },
  {
    id: 'sukk',
    title: 'Tre rolige sukk',
    blurb: 'Den korteste veien til litt mer ro',
    steps: [
      'Pust inn gjennom nesen, og ta et lite ekstra pust på toppen.',
      'Slipp lufta ut gjennom munnen med et langt sukk.',
      'Gjenta to ganger til, i ditt eget tempo.',
      'Kjenn etter. Ofte er skuldrene litt lavere nå.'
    ]
  }
];

export default function renderBreathe(root) {
  const timers = new Set();
  let running = false;
  let round = 0;
  let subCleanup = null;

  const wait = (ms, fn) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };

  const stopTimers = () => {
    for (const id of timers) clearTimeout(id);
    timers.clear();
  };

  /* ------------------------------------------------------------ Elementer */

  const circle = el('div', { class: 'breath-circle' }, [
    el('div', { class: 'breath-core', 'aria-hidden': 'true' })
  ]);

  const phaseText = el('p', {
    class: 'breath-phase',
    role: 'status',
    'aria-live': 'polite',
    text: 'Klar når du er det.'
  });

  const roundText = el('p', { class: 'faint center', text: `${ROUNDS} rolige runder` });

  const toggleBtn = el('button', {
    class: 'btn',
    type: 'button',
    text: 'Start',
    onclick: () => (running ? stop(true) : start())
  });

  const done = el('div', { class: 'breath-done', hidden: true }, [
    el('p', { class: 'lead center', 'data-done-text': '', text: '' }),
    el('button', {
      class: 'btn btn-ghost',
      type: 'button',
      text: 'Start på nytt',
      onclick: () => start()
    })
  ]);

  /* -------------------------------------------------------------- Øvelsen */

  function setPhase(phase) {
    phaseText.textContent = phase.text;
    circle.dataset.phase = phase.key;
    circle.style.transitionDuration = `${phase.seconds}s`;
    circle.style.transform = `scale(${phase.scale})`;
  }

  function runPhase(index) {
    if (!running) return;

    if (index >= PHASES.length) {
      round += 1;
      if (round >= ROUNDS) return finish();
      roundText.textContent = `Runde ${round + 1} av ${ROUNDS}`;
      return runPhase(0);
    }

    const phase = PHASES[index];
    setPhase(phase);
    wait(phase.seconds * 1000, () => runPhase(index + 1));
  }

  function start() {
    stopTimers();
    running = true;
    round = 0;
    done.hidden = true;
    toggleBtn.textContent = 'Stopp';
    roundText.textContent = `Runde 1 av ${ROUNDS}`;
    phaseText.textContent = 'Gjør deg klar…';
    circle.style.transitionDuration = '1.2s';
    circle.style.transform = 'scale(0.62)';
    wait(1400, () => runPhase(0));
  }

  function stop(byUser) {
    stopTimers();
    running = false;
    toggleBtn.textContent = 'Start';
    circle.dataset.phase = '';
    circle.style.transitionDuration = '1.6s';
    circle.style.transform = 'scale(0.82)';
    phaseText.textContent = byUser ? 'Vi stopper her.' : 'Klar når du er det.';
    roundText.textContent = `${ROUNDS} rolige runder`;

    if (byUser && round > 0) {
      showDone('Fint at du tok deg tid. Selv noen pust teller.');
    }
  }

  function finish() {
    stopTimers();
    running = false;
    toggleBtn.textContent = 'Start';
    circle.dataset.phase = '';
    circle.style.transitionDuration = '1.6s';
    circle.style.transform = 'scale(0.82)';
    phaseText.textContent = 'Ferdig.';
    roundText.textContent = `${ROUNDS} rolige runder`;
    showDone('Bra. Kroppen din får mer ro nå.');
  }

  function showDone(message) {
    done.querySelector('[data-done-text]').textContent = message;
    done.hidden = false;
  }

  /* --------------------------------------------------------- Korte øvelser */

  const exerciseList = el(
    'div',
    { class: 'stack' },
    EXERCISES.map((ex) =>
      el(
        'button',
        {
          class: 'card tappable exercise',
          type: 'button',
          onclick: () => openExercise(ex)
        },
        [
          el('span', { class: 'exercise-text' }, [
            el('span', { class: 'exercise-title', text: ex.title }),
            el('span', { class: 'faint', text: ex.blurb })
          ]),
          el('span', { class: 'chev', 'aria-hidden': 'true', text: '›' })
        ]
      )
    )
  );

  function openExercise(ex) {
    stop(false);
    stopTimers();
    clear(root);
    subCleanup = renderExercise(root, ex, () => {
      if (subCleanup) subCleanup();
      subCleanup = null;
      clear(root);
      renderBreathe(root);
    });
  }

  /* ---------------------------------------------------------------- Siden */

  root.append(
    el('div', { class: 'stack-lg' }, [
      el('header', { class: 'stack' }, [
        el('h1', { class: 'center', text: 'Pusterom' }),
        el('p', {
          class: 'lead center',
          text: 'Følg sirkelen i ditt eget tempo. Klarer du ikke å følge helt med, er det også greit.'
        })
      ]),

      el('section', { class: 'breath-stage' }, [circle, phaseText]),

      el('div', { class: 'stack' }, [toggleBtn, roundText]),

      done,

      el('section', { class: 'stack' }, [
        el('h2', { text: 'Andre små øvelser' }),
        exerciseList
      ])
    ])
  );

  // Startposisjon for sirkelen.
  requestAnimationFrame(() => {
    circle.style.transitionDuration = '1.6s';
    circle.style.transform = 'scale(0.82)';
  });

  return () => {
    running = false;
    stopTimers();
    if (subCleanup) subCleanup();
    subCleanup = null;
  };
}

/* ------------------------------------------------- Guidet enkeltøvelse --- */

function renderExercise(root, ex, onBack) {
  let step = 0;
  let tickId = null;

  const stepText = el('p', {
    class: 'exercise-step',
    role: 'status',
    'aria-live': 'polite',
    text: ex.steps[0]
  });

  const counter = el('p', { class: 'faint center', text: `1 av ${ex.steps.length}` });

  const nextBtn = el('button', {
    class: 'btn',
    type: 'button',
    text: ex.steps.length > 1 ? 'Neste' : 'Ferdig',
    onclick: next
  });

  const timerText = ex.timer
    ? el('p', { class: 'exercise-timer', text: formatSeconds(ex.timer) })
    : null;

  const timerBtn = ex.timer
    ? el('button', { class: 'btn btn-soft', type: 'button', text: 'Start minuttet', onclick: startTimer })
    : null;

  function next() {
    if (step < ex.steps.length - 1) {
      step += 1;
      stepText.textContent = ex.steps[step];
      counter.textContent = `${step + 1} av ${ex.steps.length}`;
      if (step === ex.steps.length - 1) nextBtn.textContent = 'Ferdig';
    } else {
      onBack();
    }
  }

  function startTimer() {
    if (tickId) return;
    let left = ex.timer;
    timerText.textContent = formatSeconds(left);
    timerBtn.textContent = 'Teller ned…';
    timerBtn.disabled = true;

    tickId = setInterval(() => {
      left -= 1;
      timerText.textContent = formatSeconds(Math.max(left, 0));
      if (left <= 0) {
        clearInterval(tickId);
        tickId = null;
        timerBtn.disabled = false;
        timerBtn.textContent = 'Ta ett til';
        stepText.textContent = 'Der. Ett helt minutt bare for deg.';
      }
    }, 1000);
  }

  root.append(
    el('div', { class: 'stack-lg' }, [
      el('button', { class: 'btn btn-ghost back', type: 'button', text: '‹ Tilbake', onclick: onBack }),

      el('header', { class: 'stack center' }, [
        el('h1', { text: ex.title }),
        el('p', { class: 'lead', text: ex.blurb })
      ]),

      el('section', { class: 'card card-airy card-tinted center stack' }, [
        stepText,
        timerText,
        counter
      ]),

      el('div', { class: 'stack' }, [timerBtn, nextBtn].filter(Boolean))
    ])
  );

  return () => {
    if (tickId) clearInterval(tickId);
  };
}

function formatSeconds(total) {
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}
