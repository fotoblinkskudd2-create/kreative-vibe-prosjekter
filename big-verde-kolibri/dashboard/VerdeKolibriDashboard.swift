// Verde Kolibri – Mission Control Dashboard (SwiftUI, iOS 17+)
//
// MVP-dashboard for feltoperatøren: batteristatus, vind/is-varsling,
// solcelleinntak og PanicSafe-modus (pusteøvelse + auto return-to-home).
// Dra fila inn i et Xcode-prosjekt og sett VerdeKolibriDashboard som root view.

import SwiftUI

// MARK: - Telemetri-modell

struct DroneTelemetry {
    var batteryPercent: Double = 87
    var windSpeedMs: Double = 7.2
    var temperatureC: Double = -1.5
    var icingDetected: Bool = false
    var solarInputW: Double = 31
    var flightMinutesRemaining: Double = 24
    var missionProgress: Double = 0.42
}

@Observable
final class MissionViewModel {
    var telemetry = DroneTelemetry()
    var panicSafeActive = false
    var returningHome = false

    var windStatus: (label: String, color: Color) {
        switch telemetry.windSpeedMs {
        case ..<8: return ("Rolig", .green)
        case ..<12: return ("Kolibri-sone", .yellow)   // over standarddroners grense, innenfor vår
        default: return ("Over grense", .red)
        }
    }

    func activatePanicSafe() {
        panicSafeActive = true
        returningHome = true
        // TODO: send RTH-kommando til flight controller (MAVLink / DJI SDK)
    }
}

// MARK: - Hovedvisning

struct VerdeKolibriDashboard: View {
    @State private var model = MissionViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    missionHeader
                    telemetryGrid
                    solarCard
                    panicSafeButton
                }
                .padding()
            }
            .navigationTitle("Verde Kolibri 🌿")
            .sheet(isPresented: $model.panicSafeActive) {
                PanicSafeView(returningHome: model.returningHome)
            }
        }
    }

    private var missionHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Oppdrag: Tipp-inspeksjon, Vestland")
                .font(.headline)
            ProgressView(value: model.telemetry.missionProgress) {
                Text("\(Int(model.telemetry.missionProgress * 100)) % fullført · \(Int(model.telemetry.flightMinutesRemaining)) min igjen")
                    .font(.caption)
            }
            .tint(.green)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var telemetryGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            TelemetryTile(icon: "battery.75percent",
                          title: "Batteri",
                          value: "\(Int(model.telemetry.batteryPercent)) %",
                          tint: model.telemetry.batteryPercent > 30 ? .green : .red)
            TelemetryTile(icon: "wind",
                          title: "Vind \(model.windStatus.label)",
                          value: String(format: "%.1f m/s", model.telemetry.windSpeedMs),
                          tint: model.windStatus.color)
            TelemetryTile(icon: "thermometer.snowflake",
                          title: "Temperatur",
                          value: String(format: "%.1f °C", model.telemetry.temperatureC),
                          tint: .blue)
            TelemetryTile(icon: model.telemetry.icingDetected ? "snowflake.circle.fill" : "checkmark.shield",
                          title: "Pangolin-panel",
                          value: model.telemetry.icingDetected ? "Flekser is av" : "Isfri",
                          tint: model.telemetry.icingDetected ? .orange : .green)
        }
    }

    private var solarCard: some View {
        HStack {
            Image(systemName: "sun.max.fill")
                .font(.title)
                .foregroundStyle(.yellow)
            VStack(alignment: .leading) {
                Text("Solcelleinntak").font(.caption).foregroundStyle(.secondary)
                Text("\(Int(model.telemetry.solarInputW)) W")
                    .font(.title2.bold())
            }
            Spacer()
            Text("+\(Int(model.telemetry.solarInputW / 340 * 100)) % flytid")
                .font(.caption.bold())
                .padding(6)
                .background(.green.opacity(0.15), in: Capsule())
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var panicSafeButton: some View {
        Button {
            model.activatePanicSafe()
        } label: {
            Label("PanicSafe – pust & hent hjem", systemImage: "heart.circle.fill")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
        }
        .buttonStyle(.borderedProminent)
        .tint(.teal)
    }
}

// MARK: - PanicSafe (mental health i felt)

struct PanicSafeView: View {
    let returningHome: Bool
    @State private var breatheIn = false

    var body: some View {
        VStack(spacing: 24) {
            Text(returningHome ? "Dronen er på vei hjem. Du trenger ikke gjøre noe." : "Pust med sirkelen.")
                .font(.title3.bold())
                .multilineTextAlignment(.center)

            Circle()
                .fill(.teal.gradient)
                .frame(width: 160, height: 160)
                .scaleEffect(breatheIn ? 1.35 : 0.75)
                .animation(.easeInOut(duration: 4).repeatForever(autoreverses: true),
                           value: breatheIn)
                .onAppear { breatheIn = true }

            Text("Pust inn 4 sekunder … pust ut 4 sekunder.\nAlt annet er automatisk.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(32)
        .presentationDetents([.medium])
    }
}

// MARK: - Gjenbrukbar tile

struct TelemetryTile: View {
    let icon: String
    let title: String
    let value: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Image(systemName: icon).foregroundStyle(tint)
            Text(title).font(.caption).foregroundStyle(.secondary)
            Text(value).font(.title3.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    VerdeKolibriDashboard()
}
