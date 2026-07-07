import SwiftUI
import UserNotifications

@main
struct StressGuardianApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var orchestrator = Orchestrator.shared

    var body: some Scene {
        MenuBarExtra {
            MenuBarView()
                .environmentObject(orchestrator)
        } label: {
            Image(systemName: orchestrator.guardianState.menuBarSymbol)
        }
        .menuBarExtraStyle(.window)

        Window("Pust med meg", id: "panic") {
            PanicView()
                .environmentObject(orchestrator)
        }
        .windowResizability(.contentSize)
        .defaultPosition(.center)

        Settings {
            SettingsView()
                .environmentObject(orchestrator)
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
        Orchestrator.shared.start()
    }
}
