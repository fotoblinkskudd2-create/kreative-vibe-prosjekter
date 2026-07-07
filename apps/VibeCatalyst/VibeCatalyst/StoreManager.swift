import Foundation
import RevenueCat
import SwiftUI

/// RevenueCat-integrasjon: abonnement, kjøp og gjenoppretting.
@MainActor
final class StoreManager: ObservableObject {
    static let shared = StoreManager()

    @Published private(set) var isPro = false
    @Published private(set) var offerings: Offerings?
    @Published var lastError: String?

    /// Navnet på entitlement i RevenueCat-dashbordet
    private let proEntitlement = "pro"

    private init() {
        Task { await refresh() }
    }

    func refresh() async {
        do {
            let info = try await Purchases.shared.customerInfo()
            isPro = info.entitlements[proEntitlement]?.isActive == true
            offerings = try await Purchases.shared.offerings()
        } catch {
            lastError = error.localizedDescription
        }
    }

    func purchase(_ package: Package) async {
        do {
            let result = try await Purchases.shared.purchase(package: package)
            isPro = result.customerInfo.entitlements[proEntitlement]?.isActive == true
        } catch {
            lastError = error.localizedDescription
        }
    }

    func restore() async {
        do {
            let info = try await Purchases.shared.restorePurchases()
            isPro = info.entitlements[proEntitlement]?.isActive == true
        } catch {
            lastError = error.localizedDescription
        }
    }
}

/// Enkel paywall som viser pakkene fra RevenueCat sitt "default"-offering.
struct PaywallView: View {
    @EnvironmentObject var store: StoreManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 20) {
            Text("✨ Oppgrader til Pro")
                .font(.largeTitle.weight(.bold))
            Text("Full tilgang på Mac og iPhone. Avslutt når som helst.")
                .foregroundStyle(.secondary)

            if let packages = store.offerings?.current?.availablePackages {
                ForEach(packages, id: \.identifier) { package in
                    Button {
                        Task { await store.purchase(package); dismiss() }
                    } label: {
                        VStack {
                            Text(package.storeProduct.localizedTitle).font(.headline)
                            Text(package.localizedPriceString).font(.subheadline)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                    }
                    .buttonStyle(.borderedProminent)
                }
            } else {
                ProgressView("Henter priser…")
            }

            Button("Gjenopprett kjøp") { Task { await store.restore() } }
                .font(.footnote)

            if let error = store.lastError {
                Text(error).font(.caption).foregroundStyle(.red)
            }
        }
        .padding(32)
        .frame(minWidth: 360)
    }
}
