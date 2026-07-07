import SwiftUI

/// Base44-inspirert visuell stil: myke gradienter, runde kort, luftig typografi.
enum Vibe {
    static let corner: CGFloat = 20

    static func gradient(for state: GuardianState) -> LinearGradient {
        let colors: [Color]
        switch state {
        case .calm:     colors = [Color(hue: 0.55, saturation: 0.55, brightness: 0.85),
                                  Color(hue: 0.68, saturation: 0.50, brightness: 0.80)]
        case .elevated: colors = [Color(hue: 0.12, saturation: 0.60, brightness: 0.95),
                                  Color(hue: 0.05, saturation: 0.55, brightness: 0.90)]
        case .stressed: colors = [Color(hue: 0.02, saturation: 0.60, brightness: 0.95),
                                  Color(hue: 0.92, saturation: 0.55, brightness: 0.85)]
        case .critical: colors = [Color(hue: 0.92, saturation: 0.65, brightness: 0.80),
                                  Color(hue: 0.75, saturation: 0.60, brightness: 0.70)]
        }
        return LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
    }

    static let panicGradient = LinearGradient(
        colors: [Color(hue: 0.62, saturation: 0.45, brightness: 0.35),
                 Color(hue: 0.72, saturation: 0.50, brightness: 0.25)],
        startPoint: .top, endPoint: .bottom
    )
}

struct VibeCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: Vibe.corner, style: .continuous))
            .shadow(color: .black.opacity(0.12), radius: 8, y: 4)
    }
}

extension View {
    func vibeCard() -> some View { modifier(VibeCard()) }
}
