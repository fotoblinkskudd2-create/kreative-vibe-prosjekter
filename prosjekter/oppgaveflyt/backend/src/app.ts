import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./lib/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true, // tillater at refresh-token-cookien sendes med
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/tasks", tasksRoutes);

  // Må registreres etter rutene for å fange opp feil fra dem.
  app.use(errorHandler);

  return app;
}
