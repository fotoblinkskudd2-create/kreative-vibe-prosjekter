import { daysBetween, formatNo, monthKey } from './dates';
import { cancellationEmail } from './fixes';
import { ruleFor } from './merchants';
import { kr } from './money';
import type { Category, Leak, Recurring, Transaction } from './types';

interface Context {
  transactions: Transaction[];
  recurring: Recurring[];
  months: number;
  /** Siste dato i utskriften — brukes til å avgjøre om et fast trekk fortsatt løper. */
  newestDate: string;
}

type Rule = (ctx: Context) => Leak[];

const OVERLAP_LABELS: Record<string, string> = {
  strømming: 'strømmetjenester',
  musikk: 'musikktjenester',
  trening: 'treningsmedlemskap',
  mobil: 'mobil-/bredbåndsavtaler',
  sky: 'skylagringstjenester',
  nyheter: 'nyhetsabonnementer',
};

/** Kjører alle regler og returnerer lekkasjene sortert etter besparelse. */
export function findLeaks(
  transactions: Transaction[],
  recurring: Recurring[],
  months: number,
): Leak[] {
  const newestDate = transactions.reduce(
    (acc, t) => (t.date > acc ? t.date : acc),
    transactions[0]?.date ?? '1970-01-01',
  );
  const ctx: Context = {
    transactions,
    recurring,
    months: Math.max(months, 1),
    newestDate,
  };
  const leaks = RULES.flatMap((rule) => {
    try {
      return rule(ctx);
    } catch {
      return [];
    }
  });

  // Ikke tell samme krone to ganger. Vi går fra størst til minst besparelse og lar
  // den første regelen som treffer et brukersted beholde det.
  const seenIds = new Set<string>();
  const claimedMerchants = new Set<string>();
  const unique: Leak[] = [];
  for (const leak of leaks.sort((a, b) => b.monthlySaving - a.monthlySaving)) {
    if (seenIds.has(leak.id)) continue;
    const claims = leak.claims ?? [];
    if (claims.length > 0 && claims.every((m) => claimedMerchants.has(m))) continue;
    seenIds.add(leak.id);
    for (const m of claims) claimedMerchants.add(m);
    unique.push(leak);
  }
  return unique.filter((l) => l.monthlySaving > 0);
}

// ---------------------------------------------------------------- hjelpefunksjoner

function spendIn(ctx: Context, categories: Category[], merchants?: string[]): Transaction[] {
  return ctx.transactions.filter(
    (t) =>
      t.amount < 0 &&
      categories.includes(t.category) &&
      (!merchants || merchants.includes(t.merchant)),
  );
}

function sum(txs: Transaction[]): number {
  return txs.reduce((acc, t) => acc + Math.abs(t.amount), 0);
}

function perMonth(total: number, months: number): number {
  return Math.round(total / Math.max(months, 1));
}

function evidenceFrom(txs: Transaction[], limit = 4): string[] {
  return txs
    .slice()
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, limit)
    .map((t) => `${formatNo(t.date)}  ${t.text.slice(0, 48)}  ${kr(Math.abs(t.amount))}`);
}

// ---------------------------------------------------------------- reglene

const overlappingSubscriptions: Rule = (ctx) => {
  const byGroup = new Map<string, Recurring[]>();
  for (const sub of ctx.recurring) {
    const group = ruleFor(sub.merchant)?.overlapGroup;
    if (!group) continue;
    if (!isActive(sub, ctx.newestDate)) continue;
    const list = byGroup.get(group);
    if (list) list.push(sub);
    else byGroup.set(group, [sub]);
  }

  const leaks: Leak[] = [];
  for (const [group, subs] of byGroup) {
    if (subs.length < 2) continue;
    const sorted = [...subs].sort((a, b) => b.monthlyCost - a.monthlyCost);
    const keep = sorted[0];
    const drop = sorted.slice(1);
    const saving = drop.reduce((acc, s) => acc + s.monthlyCost, 0);
    const total = sorted.reduce((acc, s) => acc + s.monthlyCost, 0);

    leaks.push({
      id: `overlapp-${group}`,
      title: `${sorted.length} ${OVERLAP_LABELS[group] ?? 'tjenester'} samtidig`,
      why: `Du betaler for ${sorted
        .map((s) => s.merchantLabel)
        .join(', ')} i samme måned. Behold én, si opp resten — du kan bytte tilbake når som helst.`,
      category: sorted[0].category,
      monthlyCost: total,
      monthlySaving: saving,
      certainty: 'sikker',
      action: {
        kind: 'kanseller',
        label: `Si opp ${drop.map((s) => s.merchantLabel).join(' og ')}`,
        steps: [
          `Behold ${keep.merchantLabel} (${kr(keep.monthlyCost)}/mnd) — den dyreste, altså den du mest sannsynlig bruker mest.`,
          ...drop.map(
            (s) =>
              `Si opp ${s.merchantLabel}: ${kr(s.monthlyCost)}/mnd${
                ruleFor(s.merchant)?.contact ? ` — ${ruleFor(s.merchant)!.contact}` : ''
              }`,
          ),
          'Sett en påminnelse om tre måneder: hvis du ikke har savnet tjenesten, er den borte for godt.',
        ],
        email: cancellationEmail(drop[0]),
      },
      evidence: sorted.map(
        (s) =>
          `${s.merchantLabel}: ${kr(s.typicalAmount)} ${s.cadence}, ${s.count} trekk, sist ${formatNo(s.lastDate)}`,
      ),
      claims: drop.map((s) => s.merchant),
    });
  }
  return leaks;
};

const priceCreep: Rule = (ctx) =>
  ctx.recurring
    .filter((s) => s.priceIncrease != null && s.priceIncrease > 0.08 && isActive(s, ctx.newestDate))
    .map((s) => {
      const increase = s.priceIncrease!;
      const saving = Math.round(s.monthlyCost * (increase / (1 + increase)));
      return {
        id: `prisokning-${s.merchant}`,
        title: `${s.merchantLabel} har økt prisen ${Math.round(increase * 100)} %`,
        why: `Trekket har gått fra omtrent ${kr(
          Math.round(s.typicalAmount / (1 + increase)),
        )} til ${kr(s.typicalAmount)} i perioden. Prisøkninger skjer stille — de fleste oppdager dem aldri.`,
        category: s.category,
        monthlyCost: s.monthlyCost,
        monthlySaving: saving,
        certainty: 'sikker' as const,
        action: {
          kind: 'bytt' as const,
          label: `Reforhandle eller bytt bort ${s.merchantLabel}`,
          steps: [
            `Ring eller skriv til ${s.merchantLabel} og si at du vurderer å si opp på grunn av prisøkningen.`,
            'Spør konkret om kampanjepris for eksisterende kunder — den finnes nesten alltid.',
            'Får du nei, si opp og gå til en konkurrent. Gjenkjøpsrabatten kommer som regel innen tre måneder.',
          ],
          email: cancellationEmail(s),
        },
        evidence: s.transactions
          .slice(-5)
          .map((t) => `${formatNo(t.date)}  ${kr(Math.abs(t.amount))}`),
        claims: [s.merchant],
      };
    });

const gymCheck: Rule = (ctx) =>
  ctx.recurring
    .filter((s) => s.category === 'trening' && isActive(s, ctx.newestDate) && s.monthlyCost >= 20000)
    .map((s) => ({
      id: `trening-${s.merchant}`,
      title: `${s.merchantLabel}: ${kr(s.monthlyCost)}/mnd — bruker du det?`,
      why: 'Treningsmedlemskap er den vanligste sovende utgiften. Utskriften viser at du betaler, ikke at du møter opp. Sjekk appen din: har du vært der under åtte ganger siste måned, koster hver økt mer enn et drop-in-kort.',
      category: 'trening' as Category,
      monthlyCost: s.monthlyCost,
      monthlySaving: s.monthlyCost,
      certainty: 'estimat' as const,
      action: {
        kind: 'sjekk' as const,
        label: 'Sjekk oppmøte, så frys eller si opp',
        steps: [
          'Åpne appen til senteret og tell innsjekkinger siste 60 dager.',
          `Under 8 per måned: si opp eller frys medlemskapet — ${kr(s.monthlyCost)}/mnd tilbake.`,
          'De fleste sentre har gratis frys i 1–3 måneder. Frys er lavere terskel enn oppsigelse, og pengene er de samme.',
          'Husk oppsigelsestiden: én måned er vanlig, så jo før du sier fra, jo før stopper trekket.',
        ],
        email: cancellationEmail(s),
      },
      evidence: [
        `${s.count} trekk à ${kr(s.typicalAmount)} siden ${formatNo(s.firstDate)}`,
      ],
      claims: [s.merchant],
    }));

const zombieSubscriptions: Rule = (ctx) =>
  ctx.recurring
    .filter(
      (s) =>
        isActive(s, ctx.newestDate) &&
        s.category === 'abonnement' &&
        s.monthlyCost < 15000 &&
        !ruleFor(s.merchant)?.overlapGroup,
    )
    .slice(0, 6)
    .map((s) => ({
      id: `smaatrekk-${s.merchant}`,
      title: `${s.merchantLabel}: ${kr(s.monthlyCost)}/mnd i bakgrunnen`,
      why: `Små faste trekk er de som overlever lengst nettopp fordi de er små. ${kr(
        s.monthlyCost,
      )} i måneden er ${kr(s.monthlyCost * 12)} i året.`,
      category: s.category,
      monthlyCost: s.monthlyCost,
      monthlySaving: s.monthlyCost,
      certainty: 'estimat' as const,
      action: {
        kind: 'sjekk' as const,
        label: 'Avgjør på 30 sekunder: brukt siste måned?',
        steps: [
          `Har du brukt ${s.merchantLabel} siste 30 dagene? Nei = si opp nå.`,
          'Er du i tvil, si opp likevel. Du kan alltid tegne på nytt, og du får ofte introtilbud når du kommer tilbake.',
          ruleFor(s.merchant)?.contact
            ? `Oppsigelse: ${ruleFor(s.merchant)!.contact}`
            : 'Finn oppsigelse under "Konto" eller "Abonnement" hos leverandøren.',
        ],
        email: cancellationEmail(s),
      },
      evidence: [
        `${s.count} trekk, ${s.cadence}, sist ${formatNo(s.lastDate)} — ${kr(s.typicalAmount)}`,
      ],
      claims: [s.merchant],
    }));

const takeawayHabit: Rule = (ctx) => {
  const txs = spendIn(ctx, ['takeaway']);
  if (txs.length < 4) return [];
  const monthly = perMonth(sum(txs), ctx.months);
  if (monthly < 80000) return []; // under 800 kr/mnd er ikke en lekkasje
  const perMonthCount = txs.length / ctx.months;
  // Hjemmelaget middag koster typisk 45–60 kr per porsjon mot 250+ på levering.
  const saving = Math.round(monthly * 0.55);

  return [
    {
      id: 'takeaway',
      title: `Takeaway og levering: ${kr(monthly)}/mnd`,
      why: `${Math.round(perMonthCount)} kjøp i måneden, snitt ${kr(
        Math.round(sum(txs) / txs.length),
      )} per gang. Leveringsgebyr, servicegebyr og påslag på maten utgjør typisk 40–60 % av regningen. Samme mat laget hjemme koster en tredjedel.`,
      category: 'takeaway',
      monthlyCost: monthly,
      monthlySaving: saving,
      certainty: 'estimat',
      action: {
        kind: 'vane',
        label: 'Kutt til én bestilling i uka',
        steps: [
          'Bestem én fast dag i uka som er takeaway-dag. Alle andre dager er hjemmelaget.',
          'Slett appene fra telefonen. Terskelen ved å måtte logge inn i nettleseren stopper de fleste impulsbestillingene.',
          'Handle inn for tre middager om gangen — mangel på råvarer er den vanligste grunnen til at det blir levering.',
          `Realistisk gevinst: ${kr(saving)}/mnd, ${kr(saving * 12)} i året.`,
        ],
      },
      evidence: evidenceFrom(txs),
    },
  ];
};

const kioskPremium: Rule = (ctx) => {
  const txs = spendIn(ctx, ['takeaway'], ['kiosk', 'kaffebar']);
  if (txs.length < 6) return [];
  const monthly = perMonth(sum(txs), ctx.months);
  if (monthly < 40000) return [];
  const saving = Math.round(monthly * 0.7);

  return [
    {
      id: 'kiosk',
      title: `Kiosk og kaffebar: ${kr(monthly)}/mnd`,
      why: `${txs.length} kjøp i perioden. Kaffe og snacks fra kiosk koster tre til fem ganger butikkpris. Dette er den mest usynlige lekkasjen fordi hvert enkelt kjøp føles for lite til å bry seg om.`,
      category: 'takeaway',
      monthlyCost: monthly,
      monthlySaving: saving,
      certainty: 'estimat',
      action: {
        kind: 'vane',
        label: 'Termos og et fast snacksinnkjøp',
        steps: [
          'Kjøp en termos. Den er nedbetalt etter ni kaffekopper.',
          'Legg snacks i sekken om morgenen — kjøpet skjer fordi du er sulten uten alternativ, ikke fordi du vil.',
          'Behold én kaffe ute i uka som du faktisk nyter. Totalforbud varer sjelden mer enn to uker.',
        ],
      },
      evidence: evidenceFrom(txs),
    },
  ];
};

const fees: Rule = (ctx) => {
  const txs = spendIn(ctx, ['gebyr']);
  if (txs.length === 0) return [];
  const monthly = perMonth(sum(txs), ctx.months);
  if (monthly < 2000) return [];

  return [
    {
      id: 'gebyrer',
      title: `Gebyrer og renter: ${kr(monthly)}/mnd`,
      why: 'Dette er rene straffepenger — du får ingenting for dem. Purregebyr, overtrekk, valutapåslag og kredittrenter kan fjernes helt, ikke bare reduseres.',
      category: 'gebyr',
      monthlyCost: monthly,
      monthlySaving: monthly,
      certainty: 'sikker',
      action: {
        kind: 'sjekk',
        label: 'Fjern årsaken, ikke bare gebyret',
        steps: [
          'Sett opp avtalegiro eller eFaktura på alt som har forfallsdato. Purregebyr forsvinner samme måned.',
          'Ring banken og be om å få slettet gebyrer fra siste tre måneder. De sletter oftere enn folk tror når du spør.',
          'Har du kredittkortrente: dette er den dyreste kronen i økonomien din. Nedbetal dette kortet før du sparer noe annet.',
          'Betaler du i utenlandsk valuta: bytt til et kort uten valutapåslag.',
        ],
      },
      evidence: evidenceFrom(txs, 6),
    },
  ];
};

const electricity: Rule = (ctx) => {
  const strom = ctx.recurring.filter((s) => s.merchant === 'strom' && isActive(s, ctx.newestDate));
  const monthly = strom.reduce((acc, s) => acc + s.monthlyCost, 0);
  if (monthly < 60000) return [];
  const saving = Math.round(monthly * 0.15);

  return [
    {
      id: 'strom',
      title: `Strøm: ${kr(monthly)}/mnd`,
      why: 'Fastprisavtaler og "forvaltede" avtaler ligger typisk 10–20 % over ren spotpris med lavt påslag. Forskjellen er ren margin hos leverandøren — du får identisk strøm.',
      category: 'bolig',
      monthlyCost: monthly,
      monthlySaving: saving,
      certainty: 'estimat',
      action: {
        kind: 'bytt',
        label: 'Sjekk avtalen mot spotpris',
        steps: [
          'Finn påslaget og månedsgebyret i siste faktura — de står ofte med liten skrift nederst.',
          'Sammenlign på Forbrukerrådets strømpriskalkulator (strompris.no). Den er offentlig og uavhengig.',
          'Bytte tar fem minutter og gjøres av den nye leverandøren. Du mister aldri strømmen underveis.',
          `Realistisk gevinst: ${kr(saving)}/mnd.`,
        ],
      },
      evidence: strom.map(
        (s) => `${s.merchantLabel}: ${kr(s.typicalAmount)} ${s.cadence}, ${s.count} trekk`,
      ),
    },
  ];
};

const insurance: Rule = (ctx) => {
  const forsikring = ctx.recurring.filter((s) => s.category === 'forsikring' && isActive(s, ctx.newestDate));
  const monthly = forsikring.reduce((acc, s) => acc + s.monthlyCost, 0);
  if (monthly < 50000) return [];
  const saving = Math.round(monthly * (forsikring.length > 1 ? 0.2 : 0.12));

  return [
    {
      id: 'forsikring',
      title: `Forsikring: ${kr(monthly)}/mnd`,
      why:
        forsikring.length > 1
          ? `Du har forsikringer hos ${forsikring.length} steder. Samlerabatt gir typisk 15–25 % når alt ligger hos én leverandør.`
          : 'Forsikringspremier stiger automatisk hvert år hvis ingen sier fra. Et tilbud fra en konkurrent gir nesten alltid lavere pris — også hos din nåværende leverandør.',
      category: 'forsikring',
      monthlyCost: monthly,
      monthlySaving: saving,
      certainty: 'estimat',
      action: {
        kind: 'bytt',
        label: 'Hent to konkurrerende tilbud',
        steps: [
          'Finn dagens vilkår og egenandeler — du skal sammenligne likt mot likt, ikke bare pris.',
          'Be om tilbud fra to andre selskaper på hele pakken samlet.',
          'Ring dagens selskap med tilbudet i hånden og be dem matche. Sier de nei, bytt.',
          'Sjekk samtidig om du betaler for dekning du allerede har gjennom fagforening, jobb eller kredittkort.',
        ],
      },
      evidence: forsikring.map((s) => `${s.merchantLabel}: ${kr(s.typicalAmount)} ${s.cadence}`),
    },
  ];
};

const impulseShopping: Rule = (ctx) => {
  const txs = spendIn(ctx, ['shopping']).filter((t) => Math.abs(t.amount) <= 150000);
  if (txs.length < 5) return [];
  const monthly = perMonth(sum(txs), ctx.months);
  if (monthly < 60000) return [];
  const saving = Math.round(monthly * 0.35);

  return [
    {
      id: 'impulskjop',
      title: `Småkjøp på nett: ${kr(monthly)}/mnd`,
      why: `${txs.length} kjøp under 1 500 kr i perioden. Enkeltkjøpene er små nok til at de aldri vurderes, og det er nettopp derfor de blir mange. Rundt en tredjedel av dem ville ikke blitt gjennomført med et døgns ventetid.`,
      category: 'shopping',
      monthlyCost: monthly,
      monthlySaving: saving,
      certainty: 'estimat',
      action: {
        kind: 'vane',
        label: '24-timersregelen',
        steps: [
          'Alt over 300 kr legges i handlekurven og får ligge et døgn. Vil du fortsatt ha det i morgen, kjøp det.',
          'Slett lagrede kort i nettleseren og i butikkappene. Friksjon virker bedre enn viljestyrke.',
          'Fjern varselvarsler fra nettbutikker — "salg" er ikke informasjon, det er en trigger.',
          `Realistisk gevinst: ${kr(saving)}/mnd.`,
        ],
      },
      evidence: evidenceFrom(txs, 5),
    },
  ];
};

const gambling: Rule = (ctx) => {
  const txs = spendIn(ctx, ['spill'], ['pengespill']);
  if (txs.length === 0) return [];
  const monthly = perMonth(sum(txs), ctx.months);
  if (monthly < 20000) return [];

  return [
    {
      id: 'pengespill',
      title: `Pengespill: ${kr(monthly)}/mnd`,
      why: `${txs.length} trekk i perioden, ${kr(
        monthly * 12,
      )} i året. Dette er den eneste posten i listen der forventet avkastning er negativ per definisjon.`,
      category: 'spill',
      monthlyCost: monthly,
      monthlySaving: monthly,
      certainty: 'sikker',
      action: {
        kind: 'vane',
        label: 'Sett grense eller sperre',
        steps: [
          'Norsk Tipping har spillegrenser du kan sette selv, og en frivillig utestengelse som virker på tvers av alle norske aktører.',
          'Mange banker kan blokkere kortbetaling til spillselskaper — ring og be om det.',
          'Trenger du noen å snakke med: Hjelpelinjen for spilleavhengige, 800 800 40, gratis og anonymt.',
        ],
      },
      evidence: evidenceFrom(txs, 5),
    },
  ];
};

const cashWithdrawals: Rule = (ctx) => {
  const txs = spendIn(ctx, ['kontanter']);
  if (txs.length < 3) return [];
  const monthly = perMonth(sum(txs), ctx.months);
  if (monthly < 100000) return [];

  return [
    {
      id: 'kontanter',
      title: `Kontantuttak: ${kr(monthly)}/mnd`,
      why: `${txs.length} uttak i perioden. Kontanter er den eneste utgiften banken ikke kan kategorisere — og dermed den eneste du ikke kan gjennomgå senere. Uttaksgebyr i fremmed minibank kommer i tillegg.`,
      category: 'kontanter',
      monthlyCost: monthly,
      monthlySaving: Math.round(monthly * 0.25),
      certainty: 'estimat',
      action: {
        kind: 'vane',
        label: 'Betal med kort, ta ut i egen bank',
        steps: [
          'Bruk kort der du kan — da havner utgiften i denne oversikten neste gang du skanner.',
          'Må du ha kontanter: ta ut i din egen banks minibank eller be om kontanter i butikkassen. Gebyret er null.',
          'Ett større uttak koster mindre i gebyr enn fem små.',
        ],
      },
      evidence: evidenceFrom(txs, 4),
    },
  ];
};

const unusedSince: Rule = (ctx) => {
  // Faste trekk som fortsetter, men der siste trekk ligger uvanlig langt tilbake,
  // kan være avsluttet allerede. Vi lar dem være — men trekk som løper og som
  // ikke er dekket av andre regler, samles i én "gjennomgå"-post.
  const covered = new Set(
    ctx.recurring
      .filter((s) => ruleFor(s.merchant)?.overlapGroup || s.category === 'trening')
      .map((s) => s.merchant),
  );
  const rest = ctx.recurring.filter(
    (s) =>
      isActive(s, ctx.newestDate) &&
      !covered.has(s.merchant) &&
      s.category !== 'bolig' &&
      s.category !== 'forsikring' &&
      s.category !== 'sparing' &&
      s.category !== 'abonnement' &&
      s.monthlyCost >= 5000,
  );
  if (rest.length < 2) return [];
  const monthly = rest.reduce((acc, s) => acc + s.monthlyCost, 0);

  return [
    {
      id: 'gjennomgang',
      title: `${rest.length} andre faste trekk: ${kr(monthly)}/mnd`,
      why: 'Disse ser ut som faste trekk, men appen kjenner ikke igjen leverandøren. Gå gjennom dem én gang — det er her de virkelig glemte avtalene pleier å ligge.',
      category: 'ukjent',
      monthlyCost: monthly,
      monthlySaving: Math.round(monthly * 0.3),
      certainty: 'estimat',
      action: {
        kind: 'sjekk',
        label: 'Gå gjennom listen én gang',
        steps: [
          'Kjenner du ikke igjen navnet: søk opp teksten fra utskriften. Betalingsformidlere som Stripe og PayPal skjuler hvem som egentlig trekker.',
          'Alt du ikke kan forklare på ti sekunder, skal sies opp.',
          'Sjekk kortet ditt i nettbanken for "faste betalingsavtaler" — der ligger de du har glemt.',
        ],
      },
      evidence: rest.map(
        (s) =>
          `${s.merchantLabel}: ${kr(s.typicalAmount)} ${s.cadence}, sist ${formatNo(s.lastDate)}`,
      ),
      claims: rest.map((s) => s.merchant),
    },
  ];
};

const RULES: Rule[] = [
  overlappingSubscriptions,
  priceCreep,
  gymCheck,
  zombieSubscriptions,
  takeawayHabit,
  kioskPremium,
  fees,
  electricity,
  insurance,
  impulseShopping,
  gambling,
  cashWithdrawals,
  unusedSince,
];

/** Et fast trekk regnes som aktivt hvis siste trekk er innenfor to perioder. */
function isActive(sub: Recurring, newestDate: string): boolean {
  const periodDays =
    sub.cadence === 'ukentlig'
      ? 7
      : sub.cadence === 'månedlig'
        ? 31
        : sub.cadence === 'kvartalsvis'
          ? 92
          : sub.cadence === 'halvårlig'
            ? 183
            : 366;
  return daysBetween(sub.lastDate, newestDate) <= periodDays * 2;
}

/** Antall måneder utskriften dekker, minst 1. */
export function monthsCovered(transactions: Transaction[]): number {
  if (transactions.length === 0) return 1;
  const dates = transactions.map((t) => t.date).sort();
  const span = daysBetween(dates[0], dates[dates.length - 1]);
  const distinctMonths = new Set(transactions.map((t) => monthKey(t.date))).size;
  return Math.max(1, Math.max(span / 30.44, distinctMonths - 1));
}
