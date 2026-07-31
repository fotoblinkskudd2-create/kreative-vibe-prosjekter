import type { Category } from './types';

export interface MerchantRule {
  /** Nøkkelord som må finnes i den rensede teksten */
  match: string[];
  key: string;
  label: string;
  category: Category;
  /** Kjent abonnementstjeneste — brukes til å gjenkjenne faste trekk raskere */
  subscription?: boolean;
  /** Domene/adresse for oppsigelse */
  contact?: string;
  /** Tjenester i samme "familie" — flere aktive samtidig er overlapp */
  overlapGroup?: 'strømming' | 'musikk' | 'trening' | 'mobil' | 'sky' | 'nyheter';
}

/**
 * Regler treffer på nøkkelord i banktekst. Rekkefølgen betyr noe: første treff vinner,
 * så spesifikke regler står før generelle.
 */
export const MERCHANT_RULES: MerchantRule[] = [
  // --- Strømming ---
  { match: ['netflix'], key: 'netflix', label: 'Netflix', category: 'abonnement', subscription: true, contact: 'netflix.com/CancelPlan', overlapGroup: 'strømming' },
  { match: ['hbo', 'max.com'], key: 'hbomax', label: 'HBO Max', category: 'abonnement', subscription: true, contact: 'max.com', overlapGroup: 'strømming' },
  { match: ['disney'], key: 'disneyplus', label: 'Disney+', category: 'abonnement', subscription: true, contact: 'disneyplus.com', overlapGroup: 'strømming' },
  { match: ['viaplay'], key: 'viaplay', label: 'Viaplay', category: 'abonnement', subscription: true, contact: 'viaplay.no', overlapGroup: 'strømming' },
  { match: ['tv 2 play', 'tv2 play', 'tv2play'], key: 'tv2play', label: 'TV 2 Play', category: 'abonnement', subscription: true, contact: 'tv2.no/play', overlapGroup: 'strømming' },
  { match: ['skyshowtime'], key: 'skyshowtime', label: 'SkyShowtime', category: 'abonnement', subscription: true, contact: 'skyshowtime.com', overlapGroup: 'strømming' },
  { match: ['prime video', 'amazon prime'], key: 'primevideo', label: 'Prime Video', category: 'abonnement', subscription: true, contact: 'amazon.com', overlapGroup: 'strømming' },
  { match: ['strim'], key: 'strim', label: 'Strim', category: 'abonnement', subscription: true, contact: 'strim.no', overlapGroup: 'strømming' },
  { match: ['allente', 'canal digital'], key: 'allente', label: 'Allente', category: 'abonnement', subscription: true, contact: 'allente.no', overlapGroup: 'strømming' },

  // --- Musikk ---
  { match: ['spotify'], key: 'spotify', label: 'Spotify', category: 'abonnement', subscription: true, contact: 'spotify.com/account', overlapGroup: 'musikk' },
  { match: ['tidal'], key: 'tidal', label: 'Tidal', category: 'abonnement', subscription: true, contact: 'tidal.com', overlapGroup: 'musikk' },
  { match: ['youtube premium', 'youtubepremium', 'google youtube'], key: 'youtubepremium', label: 'YouTube Premium', category: 'abonnement', subscription: true, contact: 'youtube.com/paid_memberships', overlapGroup: 'musikk' },
  { match: ['apple music'], key: 'applemusic', label: 'Apple Music', category: 'abonnement', subscription: true, contact: 'apple.com', overlapGroup: 'musikk' },

  // --- Sky og programvare ---
  { match: ['icloud', 'apple.com/bill', 'apple services'], key: 'icloud', label: 'Apple / iCloud', category: 'abonnement', subscription: true, contact: 'apple.com', overlapGroup: 'sky' },
  { match: ['google one', 'google storage'], key: 'googleone', label: 'Google One', category: 'abonnement', subscription: true, contact: 'one.google.com', overlapGroup: 'sky' },
  { match: ['dropbox'], key: 'dropbox', label: 'Dropbox', category: 'abonnement', subscription: true, contact: 'dropbox.com', overlapGroup: 'sky' },
  { match: ['microsoft 365', 'office 365', 'microsoft*'], key: 'microsoft365', label: 'Microsoft 365', category: 'abonnement', subscription: true, contact: 'microsoft.com', overlapGroup: 'sky' },
  { match: ['adobe'], key: 'adobe', label: 'Adobe', category: 'abonnement', subscription: true, contact: 'adobe.com' },
  { match: ['openai', 'chatgpt'], key: 'openai', label: 'OpenAI', category: 'abonnement', subscription: true, contact: 'openai.com' },
  { match: ['anthropic', 'claude.ai'], key: 'anthropic', label: 'Anthropic', category: 'abonnement', subscription: true, contact: 'claude.ai' },

  // --- Nyheter ---
  { match: ['schibsted', 'aftenposten', 'vg pluss', 'vg+'], key: 'schibsted', label: 'Avis (Schibsted)', category: 'abonnement', subscription: true, overlapGroup: 'nyheter' },
  { match: ['dagbladet', 'nettavisen', 'dagens naeringsliv', 'dn.no'], key: 'avis', label: 'Avisabonnement', category: 'abonnement', subscription: true, overlapGroup: 'nyheter' },

  // --- Trening ---
  { match: ['sats'], key: 'sats', label: 'SATS', category: 'trening', subscription: true, contact: 'sats.no', overlapGroup: 'trening' },
  { match: ['evo fitness', 'evo '], key: 'evo', label: 'EVO Fitness', category: 'trening', subscription: true, contact: 'evofitness.no', overlapGroup: 'trening' },
  { match: ['3t', 'family sports club', 'spenst', 'stamina', 'nr1 fitness', 'fresh fitness'], key: 'treningssenter', label: 'Treningssenter', category: 'trening', subscription: true, overlapGroup: 'trening' },

  // --- Mobil og internett ---
  { match: ['telenor'], key: 'telenor', label: 'Telenor', category: 'bolig', subscription: true, contact: 'telenor.no', overlapGroup: 'mobil' },
  { match: ['telia'], key: 'telia', label: 'Telia', category: 'bolig', subscription: true, contact: 'telia.no', overlapGroup: 'mobil' },
  { match: ['ice.no', 'ice communication', 'ice mobil'], key: 'ice', label: 'Ice', category: 'bolig', subscription: true, contact: 'ice.no', overlapGroup: 'mobil' },
  { match: ['talkmore', 'onecall', 'chilimobil', 'mycall', 'happybytes'], key: 'mobiloperator', label: 'Mobiloperatør', category: 'bolig', subscription: true, overlapGroup: 'mobil' },
  { match: ['altibox', 'get ', 'homenet'], key: 'bredband', label: 'Bredbånd', category: 'bolig', subscription: true },

  // --- Strøm ---
  { match: ['fjordkraft', 'tibber', 'norgesenergi', 'fortum', 'gudbrandsdal energi', 'agva', 'motkraft', 'stromleverandor', 'lyse', 'hafslund', 'elvia', 'glitre'], key: 'strom', label: 'Strøm', category: 'bolig', subscription: true },

  // --- Forsikring ---
  { match: ['gjensidige', 'if skadeforsikring', 'if forsikring', 'tryg', 'fremtind', 'sparebank 1 forsikring', 'storebrand', 'eika forsikring', 'codan'], key: 'forsikring', label: 'Forsikring', category: 'forsikring', subscription: true },

  // --- Takeaway og levering ---
  { match: ['foodora'], key: 'foodora', label: 'Foodora', category: 'takeaway' },
  { match: ['wolt'], key: 'wolt', label: 'Wolt', category: 'takeaway' },
  { match: ['uber eats', 'ubereats'], key: 'ubereats', label: 'Uber Eats', category: 'takeaway' },
  { match: ['just eat', 'justeat'], key: 'justeat', label: 'Just Eat', category: 'takeaway' },
  { match: ['dominos', "domino's"], key: 'dominos', label: "Domino's", category: 'takeaway' },
  { match: ['peppes'], key: 'peppes', label: 'Peppes Pizza', category: 'takeaway' },
  { match: ['mcdonald', 'burger king', 'kfc', 'max burger', 'sunset boulevard'], key: 'hurtigmat', label: 'Hurtigmat', category: 'takeaway' },
  { match: ['pizzabakeren', 'egon', 'olivia', 'big horn', 'tgi friday'], key: 'restaurant', label: 'Restaurant', category: 'takeaway' },

  // --- Kiosk og kaffe (dyrere per krone enn butikk) ---
  { match: ['narvesen', '7-eleven', '7 eleven', 'deli de luca', 'mix '], key: 'kiosk', label: 'Kiosk', category: 'takeaway' },
  { match: ['starbucks', 'espresso house', 'kaffebrenneriet', 'wayne', 'joe & the juice'], key: 'kaffebar', label: 'Kaffebar', category: 'takeaway' },

  // --- Dagligvare ---
  { match: ['rema', 'kiwi', 'coop', 'extra', 'meny', 'spar ', 'joker', 'bunnpris', 'obs ', 'oda.com', 'oda ', 'europris', 'normal', 'matkroken'], key: 'dagligvare', label: 'Dagligvare', category: 'mat' },

  // --- Transport ---
  { match: ['ruter', 'vy ', 'vygruppen', 'skyss', 'atb', 'kolumbus', 'flytoget', 'brakar'], key: 'kollektiv', label: 'Kollektivtransport', category: 'transport' },
  { match: ['circle k', 'shell', 'esso', 'uno-x', 'yx ', 'best stasjon'], key: 'drivstoff', label: 'Drivstoff', category: 'transport' },
  { match: ['bolt.eu', 'uber ', 'taxi', 'oslo taxi', 'christiania'], key: 'taxi', label: 'Taxi', category: 'transport' },
  { match: ['fjellinjen', 'bompeng', 'autopass'], key: 'bompenger', label: 'Bompenger', category: 'transport' },
  { match: ['easypark', 'apcoa', 'q-park', 'parkering'], key: 'parkering', label: 'Parkering', category: 'transport' },

  // --- Shopping ---
  { match: ['zalando', 'hm.com', 'h&m', 'zara', 'cubus', 'bikbok', 'dressmann', 'nelly', 'boozt'], key: 'klaer', label: 'Klær', category: 'shopping' },
  { match: ['temu', 'shein', 'wish', 'aliexpress'], key: 'billignett', label: 'Billige nettbutikker', category: 'shopping' },
  { match: ['komplett', 'elkjop', 'power ', 'clas ohlson', 'kjell & company', 'kjell og company'], key: 'elektronikk', label: 'Elektronikk', category: 'shopping' },
  { match: ['amazon'], key: 'amazon', label: 'Amazon', category: 'shopping' },
  { match: ['finn.no', 'ebay', 'vinted'], key: 'bruktmarked', label: 'Bruktmarked', category: 'shopping' },
  { match: ['ikea', 'jysk', 'skeidar', 'bohus'], key: 'mobler', label: 'Møbler', category: 'shopping' },

  // --- Spill og pengespill ---
  { match: ['norsk tipping', 'unibet', 'betsson', 'bet365', 'casino', 'poker'], key: 'pengespill', label: 'Pengespill', category: 'spill' },
  { match: ['steam', 'playstation', 'xbox', 'nintendo', 'epic games', 'riot games'], key: 'dataspill', label: 'Dataspill', category: 'spill' },
  { match: ['google play', 'app store', 'itunes'], key: 'appkjop', label: 'App-kjøp', category: 'spill' },

  // --- Alkohol og tobakk ---
  { match: ['vinmonopol', 'systembolaget'], key: 'vinmonopolet', label: 'Vinmonopolet', category: 'alkohol_tobakk' },
  { match: ['snus', 'tobakk', 'haypp'], key: 'snus', label: 'Snus og tobakk', category: 'alkohol_tobakk' },

  // --- Helse ---
  { match: ['apotek', 'vitusapotek', 'boots'], key: 'apotek', label: 'Apotek', category: 'helse' },
  { match: ['legevakt', 'legesenter', 'tannlege', 'fysioterapi'], key: 'helsetjeneste', label: 'Helsetjeneste', category: 'helse' },

  // --- Gebyrer og renter ---
  { match: ['purregebyr', 'inkasso', 'forsinkelsesrente', 'overtrekksgebyr', 'gebyr', 'varselgebyr'], key: 'gebyr', label: 'Gebyrer', category: 'gebyr' },
  { match: ['valutapaslag', 'valutapåslag', 'utenlandsgebyr'], key: 'valutagebyr', label: 'Valutapåslag', category: 'gebyr' },
  { match: ['kredittrente', 'rentebelastning', 'kortrente'], key: 'kredittrente', label: 'Kredittrenter', category: 'gebyr' },

  // --- Kontanter ---
  { match: ['minibank', 'atm ', 'kontantuttak'], key: 'kontanter', label: 'Kontantuttak', category: 'kontanter' },

  // --- Inn og ut ---
  { match: ['lonn', 'lønn', 'salary'], key: 'lonn', label: 'Lønn', category: 'inntekt' },
  { match: ['nav '], key: 'nav', label: 'NAV', category: 'inntekt' },
  { match: ['skatteetaten'], key: 'skatt', label: 'Skatteetaten', category: 'overforing' },
  { match: ['vipps'], key: 'vipps', label: 'Vipps', category: 'overforing' },
  { match: ['sparekonto', 'bsu', 'fondskonto', 'nordnet', 'kron', 'sbanken fond'], key: 'sparing', label: 'Sparing', category: 'sparing' },
  { match: ['husleie', 'boligkreditt', 'avdrag lan', 'boliglan', 'borettslag', 'sameie', 'felleskostnader'], key: 'bolig', label: 'Bolig', category: 'bolig' },
];

const NOISE = [
  /\bkjop\b/g,
  /\bvarekjop\b/g,
  /\bbetaling\b/g,
  /\bnett(?:giro|bank)\b/g,
  /\bautomatisk trekk\b/g,
  /\bavtalegiro\b/g,
  /\befaktura\b/g,
  /\bstraksbetaling\b/g,
  /\bkortkjop\b/g,
  /\bfra konto\b/g,
  /\btil konto\b/g,
  /\bdato\b/g,
  /\bkl\.?\s*\d{2}[.:]\d{2}/g,
  /\b\d{2}\.\d{2}\.\d{2,4}\b/g,
  /\b\d{4}\.\d{2}\.\d{2}\b/g,
  /\*+\d{2,6}\b/g, // maskerte kortnummer
  /\b\d{6,}\b/g, // konto-/referansenummer
  /\bnok\b/g,
  /\bcurr\b/g,
  /\bref\b/g,
];

/** Renser banktekst til noe som kan sammenlignes: små bokstaver, uten datoer og referanser. */
export function cleanText(text: string): string {
  let s = text.toLowerCase();
  s = s.replace(/[æ]/g, 'ae').replace(/[ø]/g, 'o').replace(/[å]/g, 'a');
  s = s.replace(/[^a-z0-9æøå&.\-*+ ]/g, ' ');
  for (const re of NOISE) s = s.replace(re, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

export interface MerchantMatch {
  key: string;
  label: string;
  category: Category;
  rule: MerchantRule | null;
}

export function identifyMerchant(text: string): MerchantMatch {
  const clean = cleanText(text);
  for (const rule of MERCHANT_RULES) {
    if (rule.match.some((needle) => clean.includes(cleanText(needle)))) {
      return { key: rule.key, label: rule.label, category: rule.category, rule };
    }
  }
  // Ukjent: bruk de første ordene som identitet, slik at faste trekk fortsatt grupperes.
  const key = clean.split(' ').slice(0, 3).join(' ') || 'ukjent';
  return { key, label: titleCase(key), category: 'ukjent', rule: null };
}

export function ruleFor(key: string): MerchantRule | undefined {
  return MERCHANT_RULES.find((r) => r.key === key);
}

function titleCase(s: string): string {
  return s
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
