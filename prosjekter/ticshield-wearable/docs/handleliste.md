# Handleliste / BOM — TicShield MVP

## Kjernedeler (elektronikk)

| Del | Forslag | Ca. pris | Kommentar |
|---|---|---|---|
| Mikrokontroller | ESP32 DevKit (eller Raspberry Pi Pico) | 60–120 kr | ESP32 gir BLE gratis, Pico er billigere/enklere |
| IMU | MPU6050 (akselerometer + gyro) | 30–60 kr | Standard, godt dokumentert, I2C |
| Vibrasjonsmotor | Mini coin/pancake vibrasjonsmotor (3V) | 20–40 kr | Samme type som i smartklokker |
| Motordriver | Liten NPN-transistor (f.eks. 2N2222) + diode + resistor | 10 kr | For å drive vibrasjonsmotoren fra GPIO |
| Knapp | Momentary tactile button | 5 kr | Manuell hendelsesmarkering |
| Batteri | LiPo 3.7V 500–1000mAh + laderkrets (TP4056) | 80–150 kr | Armbånd-vennlig størrelse |
| Armbånd/kabinett | 3D-printet skall eller kjøpt smartklokke-rem-adapter | — | Se CAD-notat under |

**Sum kjernedeler: ca. 200–400 kr** (mye billigere enn Neupulse pre-order).

## Valgfritt — trigger mot sertifisert TENS-apparat

Ikke bygg egen strømkrets for hudkontakt. I stedet:

| Del | Forslag | Kommentar |
|---|---|---|
| Sertifisert TENS/MNS-apparat | Ferdig CE/FDA-godkjent enhet fra apotek/nettbutikk | Har allerede trygg strømbegrensning |
| Optokobler (f.eks. PC817) eller lite relé | 10–20 kr | Isolerer ESP32 fullstendig fra TENS-apparatets krets |

TicShield sin `PIN_TENS_TRIGGER` gir en kort pulssignal — koble denne via
optokobler til apparatets manuelle knapp-kontakter (aldri direkte til
elektrodene/utgangen).

## 3D-print / kabinett

- Enkelt to-delt skall, ca. 40x30x15mm, med spor for IMU + MCU + batteri.
- Rem-feste: bruk standard 20mm smartklokke-remspenner (billig, finnes
  ferdig, slipper å printe eget spenne-system).
- Print i PETG (mer slagfast enn PLA for noe som skal bæres/brukes aktivt).

## Innkjøpskilder

- AliExpress: billigst, men 2–4 ukers leveringstid — bestill dag 1 hvis du
  vil ha delene til uke 2-testen.
- Lokalt (Elfa Distrelec, Kjell & Company): dyrere, men kommer i morgen —
  bra for MVP-testen i morgen/overimorgen.
