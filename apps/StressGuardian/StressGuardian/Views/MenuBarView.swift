import SwiftUI

struct MenuBarView: View {
    @EnvironmentObject var orchestrator: Orchestrator
    @Environment(\.openWindow) private var openWindow

    var body: some View {
        VStack(spacing: 14) {
            // Status-kort
            VStack(spacing: 8) {
                Text(orchestrator.guardianState.title)
                    .font(.headline)
                    .foregroundStyle(.white)

                StressGauge(score: orchestrator.stressScore)

                Text(orchestrator.coachMessage)
                    .font(.callout)
                    .foregroundStyle(.white.opacity(0.92))
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(18)
            .frame(maxWidth: .infinity)
            .background(Vibe.gradient(for: orchestrator.guardianState),
                        in: RoundedRectangle(cornerRadius: Vibe.corner, style: .continuous))

            // Innsjekk
            VStack(alignment: .leading, spacing: 8) {
                Text("Hvordan har du det nå?")
                    .font(.subheadline.weight(.semibold))
                HStack(spacing: 8) {
                    ForEach(1...5, id: \.self) { level in
                        Button {
                            orchestrator.registerCheckIn(level: level)
                        } label: {
                            Text(emoji(for: level))
                                .font(.title2)
                        }
                        .buttonStyle(.plain)
                        .help("Nivå \(level) av 5")
                    }
                }
            }
            .vibeCard()

            // Handlinger
            HStack(spacing: 10) {
                Button {
                    orchestrator.registerBreak()
                } label: {
                    Label("Tok pause", systemImage: "cup.and.saucer.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    openWindow(id: "panic")
                    NSApp.activate(ignoringOtherApps: true)
                } label: {
                    Label("PANIKK", systemImage: "heart.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(.pink)
            }

            Divider()

            HStack {
                SettingsLink {
                    Label("Innstillinger", systemImage: "gearshape")
                }
                .buttonStyle(.plain)
                .font(.caption)

                Spacer()

                Button("Avslutt") { NSApp.terminate(nil) }
                    .buttonStyle(.plain)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(14)
        .frame(width: 320)
    }

    private func emoji(for level: Int) -> String {
        ["😌", "🙂", "😐", "😰", "🥵"][level - 1]
    }
}

/// Enkel horisontal stress-måler 0–100.
struct StressGauge: View {
    var score: Double

    var body: some View {
        VStack(spacing: 4) {
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(.white.opacity(0.25))
                    Capsule()
                        .fill(.white)
                        .frame(width: max(8, geo.size.width * score / 100))
                        .animation(.easeInOut(duration: 0.6), value: score)
                }
            }
            .frame(height: 8)

            Text("Stress: \(Int(score)) / 100")
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.85))
        }
    }
}
