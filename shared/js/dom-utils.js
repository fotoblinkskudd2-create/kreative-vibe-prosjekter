/**
 * Shared DOM utilities for frontend projects.
 * Works in any browser context (no build step required).
 */

/**
 * Escape a string for safe HTML insertion (prevents XSS).
 * @param {string} str - The raw string to escape.
 * @returns {string} HTML-safe string.
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Shorthand for document.getElementById.
 * @param {string} id - Element ID.
 * @returns {HTMLElement|null}
 */
function el(id) {
  return document.getElementById(id);
}

/**
 * Set text content and optional error styling on a status element.
 * @param {HTMLElement} element - The status display element.
 * @param {string} message - Status text.
 * @param {boolean} [isError=false] - Whether to style as error.
 */
function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}

/**
 * Toggle visibility of panels by ID. Shows the target, hides the rest.
 * @param {string} activeId - ID of the panel to show.
 * @param {string[]} allIds - IDs of all panels in the group.
 */
function showPanel(activeId, allIds) {
  allIds.forEach((id) => {
    document.getElementById(id).classList.toggle("hidden", id !== activeId);
  });
}

// Export for ES module usage; also available as globals in script tags.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { escapeHtml, el, setStatus, showPanel };
}
