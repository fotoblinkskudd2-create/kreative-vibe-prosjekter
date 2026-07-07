import SwiftUI
import WebKit
import Network

/// WKWebView-container som laster Base44-appen din, cacher aggressivt
/// og faller tilbake til sist lagrede versjon når nettet er borte.
struct WebContainerView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default() // persistent cache + localStorage
        config.defaultWebpagePreferences.allowsContentJavaScript = true

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true

        // Offline-strategi: bruk cache når nettet er nede, ellers last friskt
        let policy: URLRequest.CachePolicy = NetworkMonitor.shared.isOnline
            ? .useProtocolCachePolicy
            : .returnCacheDataElseLoad
        webView.load(URLRequest(url: url, cachePolicy: policy, timeoutInterval: 30))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    final class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            loadOfflineFallback(webView)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            loadOfflineFallback(webView)
        }

        private func loadOfflineFallback(_ webView: WKWebView) {
            // Prøv cache først; hvis det også feiler, vis innebygd offline-side
            let request = URLRequest(url: webView.url ?? URL(string: "about:blank")!,
                                     cachePolicy: .returnCacheDataDontLoad,
                                     timeoutInterval: 5)
            webView.load(request)

            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                if webView.isLoading == false && webView.url == nil {
                    webView.loadHTMLString(Self.offlineHTML, baseURL: nil)
                }
            }
        }

        static let offlineHTML = """
        <html><head><meta name="viewport" content="width=device-width, initial-scale=1">
        <style>body{font-family:-apple-system;display:flex;align-items:center;
        justify-content:center;height:100vh;margin:0;background:linear-gradient(135deg,#667eea,#764ba2);
        color:#fff;text-align:center}div{padding:32px}</style></head>
        <body><div><h1>📴 Du er offline</h1>
        <p>Koble til internett for å hente appen. Dataene dine er trygge.</p></div></body></html>
        """
    }
}

/// Overvåker nettverksstatus (brukes av offline-banner og cache-policy).
final class NetworkMonitor: ObservableObject {
    static let shared = NetworkMonitor()
    @Published private(set) var isOnline = true

    private let monitor = NWPathMonitor()

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async { self?.isOnline = (path.status == .satisfied) }
        }
        monitor.start(queue: DispatchQueue(label: "networkmonitor"))
    }
}
