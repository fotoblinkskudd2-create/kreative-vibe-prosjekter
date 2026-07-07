import Foundation

/// Valgfri AI-coach via Claude API (rå HTTP – det finnes ingen offisiell Swift-SDK).
/// Legg inn API-nøkkel i Innstillinger for å aktivere. Appen fungerer fullt ut uten.
enum ClaudeCoach {
    static var apiKey: String {
        UserDefaults.standard.string(forKey: "sg.claude.apikey") ?? ""
    }

    static var isConfigured: Bool { !apiKey.isEmpty }

    static func personalizedMessage(for context: AgentContext, completion: @escaping (String?) -> Void) {
        guard isConfigured else { completion(nil); return }

        let prompt = """
        Du er en varm, kortfattet stress-coach i en macOS-menylinjeapp. Brukerens tilstand nå:
        - Stress-score: \(Int(context.stressScore))/100 (\(context.guardianState.rawValue))
        - App-bytter siste minutt: \(context.samples.last?.appSwitches ?? 0)
        - Minutter siden pause: \(context.samples.last?.minutesSinceBreak ?? 0)
        Skriv ÉN setning på norsk (maks 15 ord) som hjelper brukeren akkurat nå. Ingen emoji-spam, maks én emoji.
        """

        var request = URLRequest(url: URL(string: "https://api.anthropic.com/v1/messages")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")

        let body: [String: Any] = [
            "model": "claude-opus-4-8",
            "max_tokens": 200,
            "messages": [["role": "user", "content": prompt]],
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { data, _, _ in
            guard
                let data,
                let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                let content = json["content"] as? [[String: Any]],
                let text = content.first(where: { ($0["type"] as? String) == "text" })?["text"] as? String
            else {
                completion(nil)
                return
            }
            completion(text.trimmingCharacters(in: .whitespacesAndNewlines))
        }.resume()
    }
}
