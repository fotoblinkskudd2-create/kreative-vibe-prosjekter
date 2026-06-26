/**
 * Shared API client for frontend projects.
 * Provides a lightweight fetch wrapper with error handling and auth support.
 */

/**
 * Create an API client with optional token-based auth.
 * @param {Object} [options]
 * @param {string} [options.baseUrl="/api"] - Base URL prefix for all requests.
 * @param {() => string|null} [options.getToken] - Function returning current auth token.
 * @returns {{ request: Function }}
 */
function createApiClient(options = {}) {
  const baseUrl = options.baseUrl || "/api";
  const getToken = options.getToken || (() => null);

  /**
   * Make an API request with automatic JSON handling and error extraction.
   * @param {string} path - API path (appended to baseUrl).
   * @param {Object} [fetchOptions] - Standard fetch options (method, body, etc).
   * @returns {Promise<any>} Parsed JSON response or null for 204.
   * @throws {Error} With server error message on non-OK responses.
   */
  async function request(path, fetchOptions = {}) {
    const headers = { "Content-Type": "application/json", ...fetchOptions.headers };
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${baseUrl}${path}`, { ...fetchOptions, headers });

    if (res.status === 204) return null;

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        data.error || (data.errors && data.errors.join(" ")) || "Noe gikk feil.";
      throw new Error(message);
    }
    return data;
  }

  return { request };
}

// Export for ES module usage; also available as global in script tags.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createApiClient };
}
