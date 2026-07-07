import Foundation

/// iCloud-synk via NSUbiquitousKeyValueStore (krever iCloud Key-Value Storage-capability).
/// Faller stille tilbake til UserDefaults hvis iCloud ikke er tilgjengelig.
enum CloudSync {
    private static let checkInKey = "sg.checkins.v1"

    static func saveCheckIns(_ checkIns: [CheckIn]) {
        guard let data = try? JSONEncoder().encode(checkIns) else { return }
        NSUbiquitousKeyValueStore.default.set(data, forKey: checkInKey)
        NSUbiquitousKeyValueStore.default.synchronize()
        UserDefaults.standard.set(data, forKey: checkInKey) // lokal backup
    }

    static func loadCheckIns() -> [CheckIn] {
        let data = NSUbiquitousKeyValueStore.default.data(forKey: checkInKey)
            ?? UserDefaults.standard.data(forKey: checkInKey)
        guard let data, let decoded = try? JSONDecoder().decode([CheckIn].self, from: data) else {
            return []
        }
        return decoded
    }
}
