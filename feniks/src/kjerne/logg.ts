/**
 * Strukturert logg.
 *
 * Hver avvist operasjon skal etterlate nok spor til at årsaken kan telles og
 * gjenfinnes i ettertid. Uten det vet du at systemet drepte 400 operasjoner,
 * men ikke om det var riktig.
 *
 * BigInt serialiseres eksplisitt som streng — `JSON.stringify` kaster på bigint.
 */

export type Nivaa = "debug" | "info" | "varsel" | "feil";

const RANG: Record<Nivaa, number> = { debug: 10, info: 20, varsel: 30, feil: 40 };

export interface Felt {
  readonly [nokkel: string]: unknown;
}

export interface Logg {
  debug(melding: string, felt?: Felt): void;
  info(melding: string, felt?: Felt): void;
  varsel(melding: string, felt?: Felt): void;
  feil(melding: string, felt?: Felt): void;
  med(faste: Felt): Logg;
}

function trygg(verdi: unknown): unknown {
  if (typeof verdi === "bigint") return verdi.toString();
  if (verdi instanceof Error) {
    return { navn: verdi.name, melding: verdi.message };
  }
  if (Array.isArray(verdi)) return verdi.map(trygg);
  if (verdi && typeof verdi === "object") {
    return Object.fromEntries(
      Object.entries(verdi as Record<string, unknown>).map(([k, v]) => [k, trygg(v)]),
    );
  }
  return verdi;
}

export interface LoggValg {
  readonly terskel?: Nivaa;
  readonly skriv?: (linje: string) => void;
  readonly na?: () => number;
}

export function lagLogg(agent: string, valg: LoggValg = {}): Logg {
  const terskel = RANG[valg.terskel ?? "info"];
  const skriv = valg.skriv ?? ((linje: string) => process.stdout.write(linje + "\n"));
  const na = valg.na ?? (() => Date.now());

  function bygg(faste: Felt): Logg {
    const send = (nivaa: Nivaa, melding: string, felt?: Felt): void => {
      if (RANG[nivaa] < terskel) return;
      skriv(
        JSON.stringify({
          t: new Date(na()).toISOString(),
          nivaa,
          agent,
          melding,
          ...(trygg({ ...faste, ...felt }) as Record<string, unknown>),
        }),
      );
    };
    return {
      debug: (m, f) => send("debug", m, f),
      info: (m, f) => send("info", m, f),
      varsel: (m, f) => send("varsel", m, f),
      feil: (m, f) => send("feil", m, f),
      med: (flere) => bygg({ ...faste, ...flere }),
    };
  }

  return bygg({});
}

/** Logg som svelger alt. For tester. */
export const stilleLogg: Logg = (() => {
  const ingenting = () => {};
  const l: Logg = {
    debug: ingenting,
    info: ingenting,
    varsel: ingenting,
    feil: ingenting,
    med: () => l,
  };
  return l;
})();
