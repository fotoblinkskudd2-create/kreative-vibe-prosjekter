import { z } from "zod";

// Appen feiler raskt og tydelig ved oppstart hvis et miljøvariabel mangler,
// i stedet for å starte med `undefined`-hemmeligheter som først smeller senere.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);
export type Env = typeof env;
