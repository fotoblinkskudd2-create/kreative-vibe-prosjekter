import SwiftUI
import RevenueCat

@main
struct VibeCatalystApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var store = StoreManager.shared
    @StateObject private var network = NetworkMonitor.shared

    init() {
        // 1) Lim inn din RevenueCat public API key (Project settings → API keys)
        Purchases.configure(withAPIKey: "appl_DIN_REVENUECAT_KEY")
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .environmentObject(network)
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var store: StoreManager
    @EnvironmentObject var network: NetworkMonitor
    @State private var showPaywall = false

    var body: some View {
        ZStack(alignment: .top) {
            // 2) Bytt til URL-en til din publiserte Base44-app
            WebContainerView(url: URL(string: "https://din-app.base44.app")!)
                .ignoresSafeArea()

            if !network.isOnline {
                OfflineBanner()
            }
        }
        .toolbar {
            if !store.isPro {
                ToolbarItem(placement: .primaryAction) {
                    Button("Oppgrader ✨") { showPaywall = true }
                }
            }
        }
        .sheet(isPresented: $showPaywall) {
            PaywallView()
                .environmentObject(store)
        }
    }
}

struct OfflineBanner: View {
    var body: some View {
        Text("📴 Offline – viser lagret versjon")
            .font(.footnote.weight(.medium))
            .padding(.horizontal, 14).padding(.vertical, 6)
            .background(.ultraThinMaterial, in: Capsule())
            .padding(.top, 8)
    }
}
