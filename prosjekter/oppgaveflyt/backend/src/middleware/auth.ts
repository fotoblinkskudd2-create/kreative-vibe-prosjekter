import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env.js";
import { UnauthorizedError } from "../lib/errors.js";

interface AccessTokenPayload {
  sub: string; // userId
}

/**
 * Verifiserer access-token fra Authorization-header (Bearer <token>).
 * Kaster UnauthorizedError (håndtert av errorHandler) ved mangel/utløp/ugyldig signatur.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Mangler eller ugyldig Authorization-header");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    req.user = { id: payload.sub };
    next();
  } catch {
    throw new UnauthorizedError("Access-token er ugyldig eller utløpt");
  }
}

/**
 * Henter innlogget bruker-id fra request. `req.user` er typet som valgfri (satt av
 * requireAuth), så kontrollere kan hente den uten `!`-assertions på hvert kall.
 */
export function requireUserId(req: Request): string {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user.id;
}
