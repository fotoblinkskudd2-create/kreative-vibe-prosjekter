import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Ugyldig input",
        fields: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Uventet feil: logg fullt for feilsøking, men lekk aldri detaljer til klienten.
  console.error("Uventet feil:", err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Noe gikk feil på serveren" },
  });
}
