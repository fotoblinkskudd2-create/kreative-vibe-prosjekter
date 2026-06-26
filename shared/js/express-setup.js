/**
 * Shared Express server factory for backend projects.
 * Reduces boilerplate for creating Express apps with common middleware.
 */

/**
 * Create a configured Express app with standard middleware.
 * @param {Object} options
 * @param {string} options.staticDir - Absolute path to static files directory.
 * @param {string} [options.name="app"] - App name for logging.
 * @returns {{ app: import('express').Express, PORT: number }}
 */
function createApp(options = {}) {
  const express = require("express");
  const path = require("path");

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  if (options.staticDir) {
    app.use(express.static(options.staticDir));
  }

  // Health-check endpoint available on all apps.
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, name: options.name || "app" });
  });

  return { app, PORT };
}

/**
 * Central error handling middleware.
 * Logs the error and returns a generic JSON error response.
 * @param {import('express').Express} app - The Express app to attach to.
 */
function attachErrorHandler(app) {
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Noe gikk galt på serveren." });
  });
}

/**
 * Start the Express server and log the URL.
 * @param {import('express').Express} app
 * @param {number} port
 * @param {string} [name="App"]
 */
function startServer(app, port, name = "App") {
  app.listen(port, () => {
    console.log(`${name} running at http://localhost:${port}`);
  });
}

module.exports = { createApp, attachErrorHandler, startServer };
