# Fem Produktkonsepter — Biomimikry i Droner & IoT

Hvert konsept kobler spesifikke funn fra `forskning-001-050.md` og
`forskning-051-100.md` til en konkret, bygbar teknisk retning.

---

## 1. AlbaWing — Dynamisk seilings-drone for ekstrem rekkevidde

**Biomimikry-grunnlag:** Vandrealbatrossens dynamiske seiling (#001) kombinert
med knølhvalens finnetuberkler (#059) og fugleflukt i V-formasjon (#069).

**Teknisk implementering:** En fastvinget drone med lange, slanke vinger og
tuberkel-mønstrede forkanter (3D-printet PLA-mold, senere karbonfiber for
produksjon). En vindgradient-sensor (differensial-pitot-rør montert på
vingetupp og kropp) måler vindskjær i sanntid og mater en
flight-controller (ArduPilot/PX4 tilpasset egen soaring-modul) som styrer
servoer for kontinuerlig stige/dykk-veksling — samme mønster som
albatrossen bruker over bølger, men her over termikk og landskapsformer.
For sverm-oppdrag flyr flere AlbaWing-enheter i V-formasjon med
posisjonsdata delt over mesh-radio (LoRa), der bakre droner justerer
posisjon for å utnytte oppvind fra dronen foran.

**Use-cases:** Langtids miljøovervåking over hav/fjell uten
oppladningsstopp (grensekontroll, søk-og-redning over store områder,
klimaforskning i utilgjengelig terreng); kommersielt: langdistanse
datainnsamling for skipsfart/fiskerinæring der batteribytte er umulig
midt i oppdrag.

**Prototype-retningslinjer:** (1) Bygg en 2 m vingespenn glidefly-modell
uten motor, test tuberkel-vingeprofil i vindtunnel mot rett forkant —
mål stall-vinkel og motstandskoeffisient. (2) Legg til
vindgradient-sensorikk og en enkel PID-kontroller for automatisk
høydeveksling over kunstig generert vindskjær (vifte-rigg). (3) Test
reell dynamisk seiling over åpent vann med sikkerhetspilot i loop. (4)
Skaler til sverm-test med 3 enheter i V-formasjon, mål faktisk
energibesparelse for bakre droner mot kontrollflukt uten formasjon.

---

## 2. CarapaceGrip — Selvhelbredende, formtilpassende dronepanser

**Biomimikry-grunnlag:** Skilpaddeskallets sekskantede panserstruktur (#038),
trebarkens selvforsegling (#091), og blekksprutens kromatoforer (#096) for
adaptiv kamuflasje.

**Teknisk implementering:** Modulære, sekskantede panserplater i
glassfiberforsterket komposittmateriale, hver med en mikrokapsel-lagdel
(inspirert av selvhelbredende betong-forskning) som inneholder et
herdemiddel — ved sprekkdannelse knuses kapslene og herdemiddelet
forsegler bruddet innen minutter, samme prinsipp som treets kvae. Hver
plate festes modulært (magnetisk + mekanisk lås) slik at en skadet plate
kan byttes individuelt uten å demontere hele dronekroppen — direkte
parallell til skilpaddeskallets uavhengige plater. En tynn
E-ink/e-paper-lagdel over platene, styrt av en lavenergi mikrokontroller,
endrer overflatemønster for kamuflasje mot bakgrunn (forenklet
kromatofor-analog, ikke levende celler, men samme funksjonsprinsipp).

**Use-cases:** Inspeksjonsdroner i farlige industrimiljøer (raffinerier,
gruver) der kollisjoner er uunngåelige; militær/politi-overvåkingsdroner
som trenger visuell tilpasning; landbruksdroner som opererer lavt over
avlinger og tåler grenkontakt uten driftsstans.

**Prototype-retningslinjer:** (1) Test mikrokapsel-herdemiddel på
enkeltplater i laboratorium — mål tid til 80 % strekkfasthet gjenopprettet
etter kontrollert sprekk. (2) Design og 3D-print sekskantet
festesystem, test byttetid for én skadet plate (mål: under 60 sekunder
uten verktøy). (3) Integrer e-paper-lag og test kontrast/synlighet av
mønsterendring i felt mot tre reelle bakgrunner. (4) Fullskala
falltest fra 3 m høyde med og uten CarapaceGrip-panser, sammenlign
funksjonell overlevelse.

---

## 3. DesertHarvest — Passiv atmosfærisk vannhøstings-node for IoT-jordbruk

**Biomimikry-grunnlag:** Namib-ørkenbillens tåkehøsting (#056), kaktus-tornenes
vannoppsamling (#057), og termitthaugens passive ventilasjon (#028).

**Teknisk implementering:** En stasjonær IoT-node med en vertikal panel-flate
mønstret med alternerende hydrofile (plasma-behandlede) og hydrofobe
(silan-belagte) soner i et sekskantet mønster kopiert fra billens ryggskall.
Kondensert tåke/dugg samles i de hydrofile sonene og ledes via
mikrokanaler (inspirert av kaktustornenes rifler) ned til en oppsamlingstank.
Selve nodehuset har et internt kanalsystem for passiv luftsirkulasjon
(termitthaug-prinsipp) som holder elektronikken kjølig uten vifte, drevet
kun av temperaturforskjellen mellom dag og natt. Et lavenergi
fuktighetssensor (kapasitiv) og LoRaWAN-radio rapporterer oppsamlet
vannmengde og jordfuktighet til en sentral jordbruks-app.

**Use-cases:** Småskala vanning i tørkeutsatte jordbruksområder uten
tilgang til strømnett; nødvannforsyning for avsidesliggende bosetninger;
integrert i droneflåter som "vannoppsamlings-stasjoner" langs
patruljeruter i ørkenmiljø.

**Prototype-retningslinjer:** (1) Lag et 30×30 cm testpanel med
billemønster, sammenlign vannoppsamling per døgn mot et flatt
kontrollpanel i identiske forhold. (2) Optimaliser rillestruktur og
helningsvinkel iterativt basert på faktisk yield. (3) Integrer passiv
ventilasjonskanal i nodehuset, mål intern temperatur mot forseglet
kontrollboks over 48 timer i direkte sol. (4) Feltpilot i reelt tørt
klima over én hel sesong, mål total vannoppsamling per kvadratmeter
panel per måned.

---

## 4. SwarmSense — Desentralisert sverm-koordineringsprotokoll for droner

**Biomimikry-grunnlag:** Slimsoppens (Physarum) veifinning (#022),
ildmaurens levende flåter (#023), og biens vinglende dans (#021).

**Teknisk implementering:** En programvareprotokoll (ikke fysisk maskinvare)
som kjører lokalt på hver drone i en sverm. Hver enhet "styrker" ruter den
selv har brukt suksessfullt (Physarum-prinsippet) ved å kringkaste en
enkel "styrke-verdi" til naboer innen radiorekkevidde — over tid
konvergerer hele svermen mot optimale ruter uten sentral server, robust mot
at enkeltdroner faller fra. Ved oppdagelse av en ressurs (f.eks. et signal,
en person i søk-og-redning) kringkaster den oppdagende dronen en kompakt
"dans"-melding (retning + avstand + konfidens, analogt biens waggle
dance) som andre droner i sverm-rekkevidde relayer videre — informasjon
sprer seg gjennom sverm på samme måte som gjennom en bikube, uten at alle
droner trenger direkte kontakt med sentral kontroll. Ved behov for
midlertidig infrastruktur (f.eks. en signal-relé-kjede over et hinder) kan
droner "koble seg" virtuelt sammen i en kjede og holde faste
relé-posisjoner til oppgaven er løst, inspirert av maurflåtens
selvsammensetning.

**Use-cases:** Søk-og-redning i katastrofeområder uten fungerende
mobilnett; landbruksdrone-sverm som kollektivt kartlegger avlingsstatus;
sikkerhetsdrone-patruljer som dekker store områder uten
enkeltpunkt-svikt (én dronefeil kollapser ikke systemet).

**Prototype-retningslinjer:** (1) Simuler protokollen i software (f.eks.
med Gazebo/ROS 2-simulering av 20+ droner) før fysisk test — valider
rutekonvergens og informasjonsspredningstid. (2) Test med 4–6 fysiske
mikrodroner i kontrollert utendørsmiljø, mål tid til sverm finner et
plassert testobjekt uten forhåndskjent posisjon. (3) Introduser
kunstig dronefeil midt i oppdrag, mål sverm-robusthet (fullfører
resten oppdraget uten omkonfigurering). (4) Skaler til 15+ enheter,
sammenlign ytelse mot sentralisert kontrollarkitektur på samme oppgave.

---

## 5. EchoNav — Passivt, GPS-fritt navigasjonssystem for droner

**Biomimikry-grunnlag:** Flaggermusens ekkolokalisering (#011), ørkenmaurens
stegintegrasjon (#013), og trekkfuglens magnetsans (#012).

**Teknisk implementering:** Et flerlags reserve-navigasjonssystem for
droner som mister GPS-signal (tunneler, gruver, jammede miljøer,
innendørs). Lag 1: et kompakt ultralyd-array (4–6 transducere) sender
pulser og bygger et sanntids avstandskart til omgivelsene — samme
prinsipp som flaggermusens ekkolokalisering, men forenklet til
kollisjonsunngåelse og grov romkartlegging. Lag 2: en
treghetsnavigasjons-enhet (IMU + hjulencoder/optisk flow-sensor)
akkumulerer bevegelse kontinuerlig for dead-reckoning-posisjonsestimat,
direkte analogt til ørkenmaurens stegintegrasjon — driftfeil
korrigeres periodisk mot ekkolokaliserings-landemerker. Lag 3: et
magnetometer gir en grov, men driftfri retningsreferanse (som
trekkfuglens magnetsans) for å holde det akkumulerte
dead-reckoning-estimatet fra å rotere feil over tid. Sensorfusjon
(Extended Kalman Filter) kombinerer alle tre lag til ett robust
posisjonsestimat.

**Use-cases:** Inspeksjonsdroner i tunneler, kloakksystemer og gruver;
søk-og-redning i kollapsede bygninger uten GPS; innendørs
lagerlogistikk-droner; militære operasjoner i GPS-jammede soner.

**Prototype-retningslinjer:** (1) Bygg og kalibrer ultralyd-arrayet
separat, test avstandsmålingsnøyaktighet mot kjente referanseavstander
i mørkt rom. (2) Implementer dead-reckoning fra IMU alene, mål
posisjonsdrift over 5 minutters flukt uten korreksjon (etabler
baseline-feilrate). (3) Legg til ekkolokaliserings-korreksjon og
magnetometer-fusjon, mål forbedret driftrate. (4) Fullskala test i
en reell tunnel/parkeringskjeller uten GPS, sammenlign endelig
posisjonsfeil mot en kontrolldrone med kun standard IMU.
