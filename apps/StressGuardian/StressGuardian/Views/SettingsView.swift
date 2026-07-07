import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var orchestrator: Orchestrator
    @AppStorage("sg.claude.apikey") private var claudeKey = ""

    var body: some View {
        Form {
            Section {
                SecureField("Claude API-nøkkel (valgfritt)", text: $claudeKey)
                Text("Med nøkkel skriver Claude personlige coach-meldinger. Uten nøkkel brukes innebygde meldinger – appen fungerer helt fint offline.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } header: {
                Text("AI-coach")
            }

            Section {
                LabeledContent("Innsjekker lagret", value: "\(orchestrator.checkIns.count)")
                Text("Historikken synkes automatisk via iCloud (Key-Value Storage) hvis appen er signert med iCloud-capability.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } header: {
                Text("iCloud")
            }
        }
        .formStyle(.grouped)
        .frame(width: 420, height: 300)
    }
}
