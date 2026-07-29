/**
 * Vaktbikkjas inngangspunkt. Kjører i sin *egen* container.
 *
 *   node --experimental-transform-types src/vaktbikkje-main.ts
 *
 * Bevisste valg her:
 *
 *  - `FENIKS_VAKT_BEVAEPNET` må settes eksplisitt til «ja». Uten den kjører
 *    vaktbikkja i tørrkjøring og logger hva den *ville* gjort. En komponent som
 *    dreper produksjonsprosesser skal ikke kunne bli bevæpnet ved uhell.
 *
 *  - Ingen `process.exit` ved feil i en runde. Vaktbikkja som krasjer er verre
 *    enn ingen vaktbikkje, for da er ingen som ser på og ingen som vet det.
 */

import { lagLogg } from "./kjerne/logg.ts";
import { FilPuls, RedisPuls } from "./orkestrator/puls-lager.ts";
import { DockerDrapsmann, STANDARD_VAKT, Vaktbikkje } from "./orkestrator/vaktbikkje.ts";
import type { PulsLager } from "./orkestrator/hjerteslag.ts";

const logg = lagLogg("vaktbikkje");

const container = process.env.FENIKS_CONTAINER ?? "feniks-master";
const bevaepnet = process.env.FENIKS_VAKT_BEVAEPNET === "ja";
const intervallMs = Number(process.env.FENIKS_VAKT_INTERVALL_MS ?? 60_000);

function lagLager(): PulsLager {
  const redisVert = process.env.FENIKS_REDIS_VERT;
  if (redisVert) {
    logg.info("bruker Redis som pulslager", { vert: redisVert });
    return new RedisPuls(redisVert, Number(process.env.FENIKS_REDIS_PORT ?? 6379));
  }
  const katalog = process.env.FENIKS_PULS_KATALOG ?? "/var/feniks/puls";
  logg.info("bruker fil som pulslager", { katalog });
  return new FilPuls(katalog);
}

const lager = lagLager();

const vaktbikkje = new Vaktbikkje(
  lager,
  new DockerDrapsmann(container, !bevaepnet, logg),
  {
    ...STANDARD_VAKT,
    nokkel: process.env.FENIKS_PULS_NOKKEL ?? STANDARD_VAKT.nokkel,
  },
  logg,
);

if (!bevaepnet) {
  logg.varsel(
    "tørrkjøring — vaktbikkja rapporterer men dreper ingenting. " +
      "Sett FENIKS_VAKT_BEVAEPNET=ja for å bevæpne den.",
  );
}

let forrigeStatus = "";
let kjorer = true;

// Avslutningen må avbryte pausen, ikke vente den ut. Med et intervall på 60 s
// ville en `await setTimeout(intervall)` gitt opptil ett minutts
// avslutningstid — og Docker sender SIGKILL etter sin egen frist på 10 s. Da
// dør vaktbikkja hardt hver gang du deployer, og siste runde blir aldri
// fullført.
const avslutning = new AbortController();

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    logg.info("avslutter", { signal });
    kjorer = false;
    avslutning.abort();
  });
}

/** Pause som våkner umiddelbart ved avslutning. */
function pause(ms: number): Promise<void> {
  return new Promise((løs) => {
    if (avslutning.signal.aborted) return løs();
    const timer = setTimeout(ferdig, ms);
    avslutning.signal.addEventListener("abort", ferdig, { once: true });
    function ferdig(): void {
      clearTimeout(timer);
      avslutning.signal.removeEventListener("abort", ferdig);
      løs();
    }
  });
}

logg.info("vaktbikkja starter", { container, bevaepnet, intervallMs });

while (kjorer) {
  try {
    const rapport = await vaktbikkje.sjekk();
    // Logg hver tilstandsendring, men ikke hver rolige runde — en vaktbikkje som
    // logger «frisk» hvert minutt begraver den ene linjen som betyr noe.
    if (rapport.status !== forrigeStatus) {
      const nivaa = rapport.status === "frisk" ? "info" : "varsel";
      logg[nivaa]("tilstandsendring", {
        status: rapport.status,
        forklaring: rapport.forklaring,
        omstarterIVindu: rapport.omstarterIVindu,
      });
      forrigeStatus = rapport.status;
    }
  } catch (feil) {
    // En feilende runde skal ikke velte vaktbikkja.
    logg.feil("runden feilet", { feil });
  }
  await pause(intervallMs);
}

await lager.lukk?.();
