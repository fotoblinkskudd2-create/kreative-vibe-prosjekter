/**
 * Shared input validation utilities for backend projects.
 * Provides reusable validators for common field types.
 */

/**
 * Validate that required fields are present and non-empty strings.
 * @param {Object} body - Request body to validate.
 * @param {string[]} fields - Required field names.
 * @returns {string[]} Array of error messages (empty if valid).
 */
function validateRequired(body, fields) {
  const errors = [];
  for (const field of fields) {
    const value = body[field];
    if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
      errors.push(`${field} er påkrevd.`);
    }
  }
  return errors;
}

/**
 * Validate string length constraints.
 * @param {string} value - The string to check.
 * @param {string} fieldName - Name for error messages.
 * @param {Object} [opts]
 * @param {number} [opts.min] - Minimum length.
 * @param {number} [opts.max] - Maximum length.
 * @returns {string|null} Error message or null if valid.
 */
function validateStringLength(value, fieldName, opts = {}) {
  if (typeof value !== "string") return `${fieldName} må være tekst.`;
  if (opts.min !== undefined && value.length < opts.min) {
    return `${fieldName} må være minst ${opts.min} tegn.`;
  }
  if (opts.max !== undefined && value.length > opts.max) {
    return `${fieldName} kan ikke være lengre enn ${opts.max} tegn.`;
  }
  return null;
}

/**
 * Validate that a value is within an allowed set.
 * @param {*} value - The value to check.
 * @param {Array} allowed - Array of allowed values.
 * @param {string} fieldName - Name for error messages.
 * @returns {string|null} Error message or null if valid.
 */
function validateEnum(value, allowed, fieldName) {
  if (!allowed.includes(value)) {
    return `${fieldName} må være en av: ${allowed.join(", ")}.`;
  }
  return null;
}

/**
 * Validate a hex color string (e.g., #7FB3A8).
 * @param {string} value - The color value.
 * @returns {string|null} Error message or null if valid.
 */
function validateHexColor(value) {
  if (!value || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return "Color må være en gyldig hex-verdi, f.eks. #7FB3A8.";
  }
  return null;
}

/**
 * Validate an email address (basic format check).
 * @param {string} value - The email to validate.
 * @returns {string|null} Error message or null if valid.
 */
function validateEmail(value) {
  if (!value || typeof value !== "string") return "E-post er påkrevd.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Ugyldig e-postformat.";
  }
  return null;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateRequired,
    validateStringLength,
    validateEnum,
    validateHexColor,
    validateEmail,
  };
}
