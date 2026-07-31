/**
 * Demodata: 120 dager med realistiske norske banklinjer.
 * Genereres som CSV og går gjennom nøyaktig samme parser som en ekte utskrift,
 * slik at demoen tester den faktiske koden — ikke en snarvei rundt den.
 */

const DAY = 86_400_000;

function iso(offsetDays: number, from: Date): string {
  return new Date(from.getTime() - offsetDays * DAY).toISOString().slice(0, 10);
}

function no(date: string): string {
  const [y, m, d] = date.split('-');
  return `${d}.${m}.${y}`;
}

function amount(kroner: number): string {
  return kroner.toFixed(2).replace('.', ',');
}

/** Enkel deterministisk pseudotilfeldighet, slik at demoen ser lik ut hver gang. */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

export function demoCsv(today = new Date()): string {
  const rand = makeRandom(20250731);
  const rows: Array<[string, string, string]> = [];
  const push = (offset: number, text: string, kronerValue: number) => {
    rows.push([no(iso(offset, today)), text, amount(kronerValue)]);
  };

  // Faste trekk gjennom fire måneder.
  for (let m = 0; m < 4; m++) {
    const base = m * 30 + Math.floor(rand() * 2);

    push(base + 2, 'NETFLIX.COM AMSTERDAM', -179);
    push(base + 5, 'HBO MAX *SUBSCRIPTION', -139);
    push(base + 7, 'DISNEY PLUS OSLO', -119);
    push(base + 11, 'SPOTIFY P26F8D9 STOCKHOLM', -129);
    push(base + 12, 'TIDAL MUSIC AS OSLO', -119);
    // Treningssenter med prisøkning fra og med nyeste måned.
    push(base + 3, 'SATS NORGE AS', m === 0 ? -549 : -499);
    push(base + 1, 'TELIA NORGE AS MOBIL', -399);
    push(base + 4, 'FJORDKRAFT AS STROM', -(1180 + Math.floor(rand() * 260)));
    push(base + 6, 'GJENSIDIGE FORSIKRING', -742);
    push(base + 8, 'ICLOUD.COM/BILL APPLE', -29);
    push(base + 9, 'DROPBOX*SUBSCRIPTION', -119);
    push(base + 14, 'AFTENPOSTEN SCHIBSTED', -249);
    push(base + 15, 'HUSLEIE BORETTSLAG', -11500);
    push(base + 20, 'OVERFORING SPAREKONTO', -2000);
    push(base, 'LONN ARBEIDSGIVER AS', 38400);
  }

  // Daglig forbruk.
  const takeaway = [
    ['FOODORA NORWAY AS', 289, 449],
    ['WOLT OSLO', 245, 415],
    ['DOMINOS PIZZA GRUNERL', 219, 339],
    ['MCDONALDS STORO', 155, 235],
  ] as const;
  const kiosk = [
    ['NARVESEN JERNBANETORG', 49, 129],
    ['ESPRESSO HOUSE OSLO S', 55, 89],
    ['7-ELEVEN GRONLAND', 65, 145],
  ] as const;
  const grocery = [
    ['REMA 1000 TOYEN', 210, 690],
    ['KIWI 891 GRONLAND', 145, 520],
    ['COOP EXTRA HASLE', 180, 610],
    ['MENY ULLEVAAL', 260, 780],
  ] as const;
  const shopping = [
    ['ZALANDO SE', 349, 899],
    ['TEMU.COM', 119, 349],
    ['KOMPLETT.NO', 299, 1290],
    ['H&M HENNES MAURITZ', 199, 749],
  ] as const;

  for (let d = 0; d < 118; d++) {
    if (rand() < 0.42) {
      const [name, lo, hi] = takeaway[Math.floor(rand() * takeaway.length)];
      push(d, name, -Math.round(lo + rand() * (hi - lo)));
    }
    if (rand() < 0.55) {
      const [name, lo, hi] = kiosk[Math.floor(rand() * kiosk.length)];
      push(d, name, -Math.round(lo + rand() * (hi - lo)));
    }
    if (rand() < 0.5) {
      const [name, lo, hi] = grocery[Math.floor(rand() * grocery.length)];
      push(d, name, -Math.round(lo + rand() * (hi - lo)));
    }
    if (rand() < 0.22) {
      const [name, lo, hi] = shopping[Math.floor(rand() * shopping.length)];
      push(d, name, -Math.round(lo + rand() * (hi - lo)));
    }
    if (rand() < 0.12) push(d, 'RUTER AS BILLETT', -42);
    if (rand() < 0.06) push(d, 'MINIBANK UTTAK DNB', -1000);
    if (rand() < 0.05) push(d, 'VINMONOPOLET OSLO', -Math.round(199 + rand() * 400));
  }

  // Gebyrer og renter.
  push(9, 'PURREGEBYR FAKTURA 88213', -70);
  push(38, 'PURREGEBYR FAKTURA 88940', -70);
  push(21, 'VALUTAPASLAG UTENLANDSK KJOP', -84);
  push(52, 'VALUTAPASLAG UTENLANDSK KJOP', -96);
  push(16, 'KREDITTRENTE KORT', -412);
  push(46, 'KREDITTRENTE KORT', -388);
  push(76, 'KREDITTRENTE KORT', -401);

  rows.sort((a, b) => {
    const [da, ma, ya] = a[0].split('.');
    const [db, mb, yb] = b[0].split('.');
    return `${ya}${ma}${da}`.localeCompare(`${yb}${mb}${db}`);
  });

  const header = 'Bokføringsdato;Beskrivelse;Beløp';
  return [header, ...rows.map((r) => r.join(';'))].join('\n');
}
