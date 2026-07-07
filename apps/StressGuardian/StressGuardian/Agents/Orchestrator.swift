import Foundation
import AppKit
import Combine

/// Kjører OpenClaw-agentkjeden hvert minutt og eier all delt tilstand.
@MainActor
final class Orchestrator: ObservableObject {
    static let shared = Orchestrator()

    // Publisert tilstand som views binder mot
    @Published var stressScore: Double = 0
    @Published var guardianState: GuardianState = .calm
    @Published var coachMessage: String = "Hei! Jeg passer på tempoet ditt i dag."
    @Published var checkIns: [CheckIn] = []
    @Published var samples: [StressSample] = []

    // Agentene
    let sensor = SensorAgent()
    private let analyst = AnalystAgent()
    private let guardian = GuardianAgent()
    private let coach = CoachAgent()

    private var timer: Timer?
    private var workspaceObserver: NSObjectProtocol?

    private init() {}

    func start() {
        checkIns = CloudSync.loadCheckIns()

        // Observer app-bytter (signal på fragmentert fokus)
        workspaceObserver = NSWorkspace.shared.notificationCenter.addObserver(
            forName: NSWorkspace.didActivateApplicationNotification,
            object: nil, queue: .main
        ) { [weak self] _ in
            Task { @MainActor in self?.sensor.noteAppSwitch() }
        }

        // Agent-tick hvert 60. sekund
        timer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { _ in
            Task { @MainActor in Orchestrator.shared.tick() }
        }
        tick()
    }

    /// Én runde gjennom hele agentkjeden.
    func tick() {
        var ctx = AgentContext(
            samples: samples,
            checkIns: checkIns,
            stressScore: stressScore,
            guardianState: guardianState,
            coachMessage: coachMessage
        )
        for agent in [sensor, analyst, guardian, coach] as [OpenClawAgent] {
            ctx = agent.process(ctx)
        }
        samples = ctx.samples
        stressScore = ctx.stressScore
        guardianState = ctx.guardianState
        coachMessage = ctx.coachMessage
    }

    // MARK: - Handlinger fra UI

    func registerCheckIn(level: Int, note: String = "") {
        checkIns.append(CheckIn(timestamp: Date(), level: level, note: note))
        if checkIns.count > 500 { checkIns.removeFirst(checkIns.count - 500) }
        CloudSync.saveCheckIns(checkIns)
        tick()
    }

    func registerBreak() {
        sensor.noteBreak()
        tick()
    }

    /// Kalles når en panikk-økt (pusteøvelse) er fullført.
    func panicSessionCompleted() {
        sensor.noteBreak()
        registerCheckIn(level: 2, note: "Fullførte pusteøvelse")
    }
}
