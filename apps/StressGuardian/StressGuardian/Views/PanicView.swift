import SwiftUI

/// Panikk-intervensjon: 4-7-8-pusteøvelse med animert sirkel + 5-4-3-2-1 grounding.
struct PanicView: View {
    @EnvironmentObject var orchestrator: Orchestrator
    @Environment(\.dismiss) private var dismiss

    enum Phase: String, CaseIterable {
        case inhale = "Pust inn"
        case hold = "Hold"
        case exhale = "Pust ut"

        var duration: Double {
            switch self {
            case .inhale: return 4
            case .hold:   return 7
            case .exhale: return 8
            }
        }

        var scale: CGFloat {
            switch self {
            case .inhale: return 1.0
            case .hold:   return 1.0
            case .exhale: return 0.45
            }
        }
    }

    @State private var phase: Phase = .inhale
    @State private var circleScale: CGFloat = 0.45
    @State private var completedCycles = 0
    @State private var secondsLeft: Int = 4
    @State private var showGrounding = false
    @State private var timerTask: Task<Void, Never>?

    private let targetCycles = 4

    var body: some View {
        ZStack {
            Vibe.panicGradient.ignoresSafeArea()

            VStack(spacing: 28) {
                if showGrounding {
                    groundingView
                } else {
                    breathingView
                }
            }
            .padding(40)
        }
        .frame(width: 420, height: 520)
        .onAppear { startBreathing() }
        .onDisappear { timerTask?.cancel() }
    }

    // MARK: - Pusteøvelse

    private var breathingView: some View {
        VStack(spacing: 24) {
            Text("Du er trygg. Pust med sirkelen.")
                .font(.title3.weight(.medium))
                .foregroundStyle(.white)

            ZStack {
                Circle()
                    .stroke(.white.opacity(0.25), lineWidth: 2)
                    .frame(width: 240, height: 240)

                Circle()
                    .fill(
                        RadialGradient(colors: [.white.opacity(0.9), .white.opacity(0.3)],
                                       center: .center, startRadius: 10, endRadius: 130)
                    )
                    .frame(width: 240, height: 240)
                    .scaleEffect(circleScale)

                VStack(spacing: 4) {
                    Text(phase.rawValue)
                        .font(.title.weight(.bold))
                        .foregroundStyle(Color(hue: 0.68, saturation: 0.6, brightness: 0.4))
                    Text("\(secondsLeft)")
                        .font(.system(size: 44, weight: .light, design: .rounded))
                        .foregroundStyle(Color(hue: 0.68, saturation: 0.6, brightness: 0.4))
                        .contentTransition(.numericText())
                }
            }

            Text("Runde \(min(completedCycles + 1, targetCycles)) av \(targetCycles)")
                .font(.caption)
                .foregroundStyle(.white.opacity(0.7))

            Button("Jeg vil heller gjøre grounding-øvelsen") {
                timerTask?.cancel()
                showGrounding = true
            }
            .buttonStyle(.plain)
            .font(.callout)
            .foregroundStyle(.white.opacity(0.85))
        }
    }

    private func startBreathing() {
        timerTask?.cancel()
        timerTask = Task { @MainActor in
            while completedCycles < targetCycles && !Task.isCancelled {
                for p in Phase.allCases {
                    phase = p
                    withAnimation(.easeInOut(duration: p.duration)) {
                        circleScale = p.scale
                    }
                    for s in stride(from: Int(p.duration), through: 1, by: -1) {
                        secondsLeft = s
                        try? await Task.sleep(nanoseconds: 1_000_000_000)
                        if Task.isCancelled { return }
                    }
                }
                completedCycles += 1
            }
            if !Task.isCancelled { finish() }
        }
    }

    // MARK: - Grounding 5-4-3-2-1

    private let groundingSteps = [
        ("👀", "5 ting du kan SE rundt deg"),
        ("✋", "4 ting du kan TA PÅ"),
        ("👂", "3 ting du kan HØRE"),
        ("👃", "2 ting du kan LUKTE"),
        ("👅", "1 ting du kan SMAKE"),
    ]
    @State private var groundingIndex = 0

    private var groundingView: some View {
        VStack(spacing: 24) {
            Text("Grounding · 5-4-3-2-1")
                .font(.title3.weight(.medium))
                .foregroundStyle(.white)

            let step = groundingSteps[groundingIndex]
            VStack(spacing: 16) {
                Text(step.0).font(.system(size: 64))
                Text(step.1)
                    .font(.title2.weight(.semibold))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.white)
            }
            .frame(height: 200)

            Button(groundingIndex < groundingSteps.count - 1 ? "Neste" : "Ferdig") {
                if groundingIndex < groundingSteps.count - 1 {
                    groundingIndex += 1
                } else {
                    finish()
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(.white.opacity(0.9))
            .foregroundStyle(Color(hue: 0.68, saturation: 0.6, brightness: 0.4))
        }
    }

    private func finish() {
        orchestrator.panicSessionCompleted()
        dismiss()
    }
}
