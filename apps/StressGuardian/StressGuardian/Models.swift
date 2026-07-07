import Foundation

/// Ett målepunkt fra sensor-agenten (samles hvert minutt).
struct StressSample: Codable, Identifiable {
    var id = UUID()
    var timestamp: Date
    /// Antall app-bytter siste minutt (høy verdi = fragmentert fokus).
    var appSwitches: Int
    /// Minutter siden sist registrerte pause.
    var minutesSinceBreak: Int
}

/// Manuell innsjekk fra brukeren (1 = rolig, 5 = panikk).
struct CheckIn: Codable, Identifiable {
    var id = UUID()
    var timestamp: Date
    var level: Int
    var note: String = ""
}

/// Hva guardian-agenten anbefaler akkurat nå.
enum GuardianState: String, Codable {
    case calm          // alt ok
    case elevated      // litt høyt tempo, myk påminnelse
    case stressed      // ta pause nå
    case critical      // foreslå panikk-intervensjon

    var menuBarSymbol: String {
        switch self {
        case .calm:     return "brain.head.profile"
        case .elevated: return "wind"
        case .stressed: return "exclamationmark.triangle"
        case .critical: return "heart.circle.fill"
        }
    }

    var title: String {
        switch self {
        case .calm:     return "Rolig og fokusert"
        case .elevated: return "Tempoet er høyt"
        case .stressed: return "På tide med pause"
        case .critical: return "Stopp. Pust. Du klarer dette."
        }
    }
}

/// Full tilstand som agentene sender mellom seg.
struct AgentContext {
    var samples: [StressSample]
    var checkIns: [CheckIn]
    var stressScore: Double          // 0–100, settes av analyst-agenten
    var guardianState: GuardianState // settes av guardian-agenten
    var coachMessage: String         // settes av coach-agenten
}
