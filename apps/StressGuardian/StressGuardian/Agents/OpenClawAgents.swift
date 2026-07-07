import Foundation
import AppKit
import UserNotifications

// MARK: - OpenClaw multi-agent-kjerne
// Hver agent er et rent, testbart steg i en pipeline:
// Sensor -> Analyst -> Guardian -> Coach. Orchestrator kjører kjeden hvert minutt.

protocol OpenClawAgent {
    var name: String { get }
    func process(_ context: AgentContext) -> AgentContext
}

// MARK: - SensorAgent
// Samler rådata: app-bytter (fragmentert fokus) og tid siden pause.
// Selve observasjonen skjer i Orchestrator (NSWorkspace-notifikasjoner);
// agenten pakker tellerne inn i et StressSample.

final class SensorAgent: OpenClawAgent {
    let name = "sensor"

    private(set) var appSwitchesThisMinute = 0
    private(set) var lastBreak = Date()

    func noteAppSwitch() { appSwitchesThisMinute += 1 }
    func noteBreak() { lastBreak = Date() }

    func process(_ context: AgentContext) -> AgentContext {
        var ctx = context
        let minutesSinceBreak = Int(Date().timeIntervalSince(lastBreak) / 60)
        ctx.samples.append(StressSample(
            timestamp: Date(),
            appSwitches: appSwitchesThisMinute,
            minutesSinceBreak: minutesSinceBreak
        ))
        if ctx.samples.count > 240 { ctx.samples.removeFirst(ctx.samples.count - 240) }
        appSwitchesThisMinute = 0
        return ctx
    }
}

// MARK: - AnalystAgent
// Regner ut en stress-score 0–100 fra de siste målingene + siste innsjekk.

final class AnalystAgent: OpenClawAgent {
    let name = "analyst"

    func process(_ context: AgentContext) -> AgentContext {
        var ctx = context
        let recent = ctx.samples.suffix(10)
        guard !recent.isEmpty else { return ctx }

        // 1) Fokus-fragmentering: >8 app-bytter/min er høyt.
        let avgSwitches = Double(recent.map(\.appSwitches).reduce(0, +)) / Double(recent.count)
        let switchScore = min(avgSwitches / 8.0, 1.0) * 35

        // 2) Pause-gjeld: 90 min uten pause gir full uttelling.
        let minutesSinceBreak = Double(recent.last?.minutesSinceBreak ?? 0)
        let breakScore = min(minutesSinceBreak / 90.0, 1.0) * 35

        // 3) Selvrapportert nivå siste time veier tyngst når det finnes.
        let hourAgo = Date().addingTimeInterval(-3600)
        let recentCheckIns = ctx.checkIns.filter { $0.timestamp > hourAgo }
        let selfScore: Double
        if let latest = recentCheckIns.last {
            selfScore = (Double(latest.level) - 1) / 4.0 * 30
        } else {
            selfScore = 0
        }

        ctx.stressScore = min(switchScore + breakScore + selfScore, 100)
        return ctx
    }
}

// MARK: - GuardianAgent
// Oversetter score til tilstand og trigger varsler ved terskelbrudd.

final class GuardianAgent: OpenClawAgent {
    let name = "guardian"

    private var lastNotifiedState: GuardianState = .calm

    func process(_ context: AgentContext) -> AgentContext {
        var ctx = context
        let newState: GuardianState
        switch ctx.stressScore {
        case ..<30:  newState = .calm
        case ..<55:  newState = .elevated
        case ..<80:  newState = .stressed
        default:     newState = .critical
        }
        ctx.guardianState = newState

        // Varsle kun ved forverring, og aldri samme tilstand to ganger på rad.
        if newState != lastNotifiedState,
           severity(newState) > severity(lastNotifiedState),
           newState != .calm {
            Notifier.send(title: newState.title, body: notificationBody(for: newState))
        }
        lastNotifiedState = newState
        return ctx
    }

    private func severity(_ s: GuardianState) -> Int {
        switch s {
        case .calm: return 0
        case .elevated: return 1
        case .stressed: return 2
        case .critical: return 3
        }
    }

    private func notificationBody(for state: GuardianState) -> String {
        switch state {
        case .elevated: return "Du bytter mellom mange apper. Én ting om gangen?"
        case .stressed: return "Lenge siden pause. Reis deg, strekk deg, drikk vann."
        case .critical: return "Åpne StressGuardian og ta en pusteøvelse – det tar 2 minutter."
        case .calm:     return ""
        }
    }
}

// MARK: - CoachAgent
// Velger budskap og øvelser. Bruker Claude API hvis nøkkel finnes, ellers lokale tekster.

final class CoachAgent: OpenClawAgent {
    let name = "coach"

    private let localMessages: [GuardianState: [String]] = [
        .calm: [
            "Fin flyt nå. Behold rytmen. 🌊",
            "Rolig puls, godt fokus. Fortsett sånn.",
        ],
        .elevated: [
            "Mange kontekstbytter. Velg én oppgave for de neste 20 minuttene.",
            "Lukk fanene du ikke trenger. Hjernen din takker deg.",
        ],
        .stressed: [
            "90 sekunder ved vinduet gjør mer enn du tror.",
            "Pause er ikke tapt tid – det er vedlikehold.",
        ],
        .critical: [
            "Dette går over. Trykk på panikk-knappen og pust med meg.",
            "Du er trygg. Én pust om gangen.",
        ],
    ]

    func process(_ context: AgentContext) -> AgentContext {
        var ctx = context
        ctx.coachMessage = localMessages[ctx.guardianState]?.randomElement() ?? ""

        // Valgfritt: la Claude skrive et personlig budskap (asynkront, oppdaterer senere).
        if ClaudeCoach.isConfigured, ctx.guardianState != .calm {
            ClaudeCoach.personalizedMessage(for: ctx) { message in
                guard let message else { return }
                DispatchQueue.main.async {
                    Orchestrator.shared.coachMessage = message
                }
            }
        }
        return ctx
    }
}

// MARK: - Notifier

enum Notifier {
    static func send(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )
        UNUserNotificationCenter.current().add(request)
    }
}
