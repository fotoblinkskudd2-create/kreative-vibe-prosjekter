# Designrefleksjon

Notater om hvorfor Vibe-kort ble bygget som den ble — for videre arbeid i `kreative-vibe-prosjekter`.

## Hvorfor et kortspill, ikke en liste

README-en beskriver repoet som et sted for "100+ idealistiske prosjekter, musikkidéer, satireprosjekter, videoer og Vibe-kort-apper". En liste med 100 rader er raskt bygget, men den blir ubrukt — man scroller forbi, ingenting fester seg. Et kort har en helt annen mekanikk: det skjuler innholdet til du aktivt ber om det, og det gir deg **ett** forslag om gangen i stedet for hundre samtidig. Det tvinger et valg — enten forkaster du idéen og trekker et nytt kort, eller du tar vare på den. Den enkle handlingen (trekk → vurder → behold/forkast) er selve grunnen til at tarotkort og idé-kortstokker fungerer som kreativitetsverktøy, og den mekanikken er billig å bygge digitalt.

## Designspråket

- **Mørk scene, ett lyspunkt.** Bakgrunnen er nesten svart med svake fargede glow-gradienter i hjørnene — en scene, ikke en side. Hvert kort får sin egen aksentfarge fra kategorien (emerald/idealistisk, fiolett/musikk, ravgul/satire, himmelblå/video), så fargen *er* kategorimarkøren i stedet for et eget UI-element man må lære seg.
- **Space Grotesk + Inter.** En geometrisk display-font for tall, titler og UI-tekst gir kortene litt teknisk/trykksak-karakter (ala et spillkort), mens Inter holder pitch-teksten lettlest i lengre avsnitt. To fonter, én jobb hver.
- **Papirkorn-overlegg.** Et lavintensivt SVG-støyfilter over hele siden bryter opp de store, flate mørke flatene så de ikke blir sterile skjermgradienter — en detalj man knapt legger merke til bevisst, men som gjør at det digitale kortet føles mer som et fysisk objekt.
- **Vannmerke-symbolet på baksiden.** Korte pitcher etterlot tomrom på et kort dimensjonert for lengre tekst. I stedet for å krympe kortet (og miste den fysiske kort-følelsen), fylles rommet med kategoriens symbol i 6 % opacity — et ekstra lag identitet, ikke et lappeteppe.

## Interaksjon

- **Trekk-knappen har en kunstig mikro-forsinkelse** (kortet snur tilbake til forsiden, så flipper til baksiden ~90 ms senere) i stedet for å hoppe rett til et nytt kort i flippet tilstand. Det er den eneste "unødvendige" animasjonen i appen, bevisst beholdt fordi den simulerer selve *trekke*-handlingen — uten den er det bare en tilfeldig tekstbytter.
- **Naviger med piltaster resetter flip-tilstanden**, mens trekk-knappen selv styrer flippen. Dette skiller to ulike brukerintensjoner: bla gjennom stokken i rekkefølge (du vil se forsiden/baksiden selv) versus trekke et tilfeldig kort (du vil se svaret med en gang).
- **Ingen build-steg.** `cards.js` og `app.js` er bevisst globale scripts, ikke ES-moduler — det betyr appen fungerer ved å dobbeltklikke `index.html` direkte fra filsystemet (`file://`), uten en lokal server. Gitt at README-en snakker om "klar-til-bygg info" og "salgsmateriell", var det viktigere at en ikke-teknisk bruker kan åpne filen enn å ha moderne modul-syntaks.

## Eksport som bro til virkeligheten

En kortstokk er gøy, men målet er å faktisk bygge noe. Eksport-knappen tar de lagrede favorittene og genererer et ferdig strukturert Markdown-pitch-ark (gruppert per kategori, med tittel/pitch/innsats) — det konkrete "salgsmateriell"-elementet README-en etterspør. Ingen backend: en `Blob` + midlertidig `<a download>` er nok, og favorittene lever kun i `localStorage` hos brukeren.

## Hva som bevisst er utelatt

- Ingen kontoer, ingen sky-lagring, ingen sporing — repoet handler om raske, personlige kreative verktøy, ikke en plattform.
- Ingen rammeverk/bundler. 100 kort og fire skjermtilstander (forside, bakside, filter, skuff) trenger ikke React for å holde seg ryddig — vanilla JS med tydelig seksjonerte funksjoner var nok, og det holder terskelen for å åpne og endre koden lav for hvem som helst som plukker opp repoet senere.
