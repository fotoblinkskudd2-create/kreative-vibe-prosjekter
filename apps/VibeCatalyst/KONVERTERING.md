# VibeCatalyst — Base44-app → Mac + iOS (Catalyst) med RevenueCat, push og offline

Base44 lager web-apper. Raskeste vei til App Store på både iPhone og Mac er å pakke
den publiserte web-appen i et native skall (WKWebView) med Mac Catalyst — og legge
native funksjoner (kjøp, push, offline) rundt. Denne mappen inneholder hele skallet.

## Steg 1 — Xcode-prosjekt

1. Xcode → *File → New → Project → **iOS → App***
   - Product Name: `VibeCatalyst` (eller navnet på appen din)
   - Interface: **SwiftUI**, Language: **Swift**, minimum iOS 16
2. Target → *General* → under **Supported Destinations**: trykk `+` og legg til
   **Mac (Mac Catalyst)**. Nå bygger samme kodebase til iPhone, iPad **og** Mac.
3. Slett generert `ContentView.swift`/`<App>App.swift`, og dra inn alle filene fra
   `VibeCatalyst/`-mappen her.

## Steg 2 — Bytt inn din app

I `VibeCatalystApp.swift`:
- Bytt `https://din-app.base44.app` til URL-en til din publiserte Base44-app.
- Bytt `appl_DIN_REVENUECAT_KEY` til din RevenueCat-nøkkel (steg 3).

## Steg 3 — RevenueCat (abonnement/kjøp)

1. Target → *Package Dependencies* → `+` →
   `https://github.com/RevenueCat/purchases-ios` (Add Package → `RevenueCat`).
2. Opprett konto på revenuecat.com → nytt prosjekt → App Store-app
   (samme bundle-id som i Xcode).
3. I App Store Connect: opprett abonnementsprodukt(er). I RevenueCat: koble produktene
   til et **entitlement** kalt `pro` og et **offering** kalt `default`.
4. Kopier **public API key** (starter med `appl_`) inn i `VibeCatalystApp.swift`.
5. Target → *Signing & Capabilities* → `+ Capability` → **In-App Purchase**.

Paywall og kjøpslogikk ligger klart i `StoreManager.swift` (kjøp, restore, entitlement-sjekk).

## Steg 4 — Push-varsler

1. Target → *Signing & Capabilities* → `+ Capability` → **Push Notifications**
   (+ **Background Modes → Remote notifications** hvis du vil ha stille push).
2. Krever betalt Apple Developer-konto. Lag en APNs-nøkkel i developer.apple.com →
   *Keys* → `+` → Apple Push Notifications service.
3. `AppDelegate.swift` registrerer enheten og printer device-tokenet.
   Enkleste vei til kampanjer uten egen backend: OneSignal eller RevenueCat-integrasjoner.

## Steg 5 — Offline

Allerede innebygd i `WebContainerView.swift`:
- Persistent `WKWebsiteDataStore` (cache + localStorage overlever omstart)
- Ved nettverksfeil: laster fra cache; hvis cache mangler vises en innebygd offline-side
- `NetworkMonitor` viser «📴 Offline»-banner automatisk

Vil du ha *ekte* offline-first: aktiver PWA/service worker i Base44-appen din —
WKWebView respekterer service workers når appen er lastet én gang online.

## Steg 6 — Kjør

- Velg *iPhone*-simulator → ⌘R → test på mobil
- Velg *My Mac (Mac Catalyst)* → ⌘R → samme app som Mac-app 🎉

## Filoversikt

```
VibeCatalystApp.swift   – app-oppsett, RevenueCat-konfig, offline-banner, paywall-knapp
WebContainerView.swift  – WKWebView-skall med cache/offline-fallback + NetworkMonitor
StoreManager.swift      – RevenueCat: kjøp, restore, entitlements + PaywallView
AppDelegate.swift       – APNs push-registrering
```
