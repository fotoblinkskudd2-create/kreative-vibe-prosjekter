# StressGuardian 🧠 — Mac menubar-app med OpenClaw multi-agent stress-vakt

Menylinjeapp for macOS som overvåker arbeidstempoet ditt med en lokal multi-agent-pipeline
(«OpenClaw»: Sensor → Analyst → Guardian → Coach), varsler når du bør ta pause,
har **panikk-intervensjon** (4-7-8-pust + 5-4-3-2-1 grounding), **Base44-vibe** i designet
og **iCloud-synk** av historikk.

Alt kjører lokalt. Claude-coach er valgfritt (legg inn API-nøkkel i Innstillinger).

## Funksjoner

| Agent | Rolle |
|---|---|
| **SensorAgent** | Teller app-bytter (fragmentert fokus) og tid siden pause |
| **AnalystAgent** | Regner stress-score 0–100 fra sensordata + dine innsjekker |
| **GuardianAgent** | Terskler → tilstand (rolig/forhøyet/stresset/kritisk) + macOS-varsler |
| **CoachAgent** | Velger budskap; bruker Claude API hvis nøkkel er lagt inn |

- 🚨 **PANIKK-knapp**: fullskjermsvindu med animert pustesirkel (4-7-8) og grounding-øvelse
- 😌 Emoji-innsjekk (1–5) rett fra menylinjen
- ☁️ iCloud Key-Value-synk av innsjekk-historikk (med lokal fallback)
- 🎨 Base44-vibe: gradient-kort, runde hjørner, glass-materiale

## Bygg i Xcode (10 minutter)

1. **Nytt prosjekt**: Xcode → *File → New → Project → macOS → App*.
   - Product Name: `StressGuardian`
   - Interface: **SwiftUI**, Language: **Swift**
   - Minimum deployment: **macOS 13.0**
2. **Slett** `ContentView.swift` og den genererte `StressGuardianApp.swift`.
3. **Dra inn alle filene** fra denne mappens `StressGuardian/`-katalog (behold mappestruktur,
   huk av «Copy items if needed» og riktig target).
4. **Skjul dock-ikonet**: Target → *Info* → legg til nøkkelen
   `Application is agent (UIElement)` (`LSUIElement`) = `YES`.
5. **Varsler**: fungerer automatisk (appen ber om tillatelse ved første start).
6. **iCloud (valgfritt, krever betalt utviklerkonto)**:
   Target → *Signing & Capabilities* → `+ Capability` → **iCloud** → huk av **Key-value storage**.
   Uten dette lagres historikk kun lokalt — appen virker uansett.
7. **App Sandbox**: hvis Sandbox er på, huk av *Outgoing Connections (Client)*
   (trengs kun for Claude-coach).
8. **Kjør** (⌘R). Ikonet dukker opp i menylinjen. 🎉

## Bruk

- Klikk hjerne-ikonet i menylinjen → status, innsjekk og handlinger.
- Trykk **PANIKK** når det koker → følg pustesirkelen (4 runder) eller bytt til grounding.
- «Tok pause» nullstiller pause-telleren og senker scoren.
- Innstillinger (⌘,) → lim inn Claude API-nøkkel for AI-coach.

## Arkitektur

```
StressGuardianApp.swift      – MenuBarExtra + panikk-vindu + settings
Agents/OpenClawAgents.swift  – Sensor/Analyst/Guardian/Coach (protokoll-basert pipeline)
Agents/Orchestrator.swift    – kjører kjeden hvert minutt, eier @Published-tilstand
Models.swift                 – StressSample, CheckIn, GuardianState, AgentContext
CloudSync.swift              – NSUbiquitousKeyValueStore + UserDefaults-fallback
ClaudeCoach.swift            – valgfri Claude API-integrasjon (rå HTTP)
Views/                       – MenuBarView, PanicView, SettingsView, VibeTheme
```
