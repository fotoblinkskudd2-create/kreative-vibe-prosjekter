import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../lib/env.js";
import { ConflictError, UnauthorizedError } from "../../lib/errors.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

const BCRYPT_COST_FACTOR = 12;

function hashRefreshToken(token: string): string {
  // Refresh-tokens lagres som hash i databasen, ikke i klartekst — en database-leak
  // gir da ikke direkte tilgang til gyldige sesjoner.
  return crypto.createHash("sha256").update(token).digest("hex");
}

function issueAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
}

async function issueRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashRefreshToken(token), expiresAt },
  });

  return token;
}

interface AuthResult {
  user: { id: string; email: string; name: string };
  accessToken: string;
  refreshToken: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("E-postadressen er allerede registrert");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST_FACTOR);
  const user = await prisma.user.create({
    data: { email: input.email, name: input.name, passwordHash },
    select: { id: true, email: true, name: true },
  });

  const [accessToken, refreshToken] = await Promise.all([
    issueAccessToken(user.id),
    issueRefreshToken(user.id),
  ]);

  return { user, accessToken, refreshToken };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Samme feilmelding uansett om e-post finnes eller passord er feil,
  // for å ikke avsløre hvilke e-poster som er registrert (user enumeration).
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new UnauthorizedError("Feil e-post eller passord");
  }

  const [accessToken, refreshToken] = await Promise.all([
    issueAccessToken(user.id),
    issueRefreshToken(user.id),
  ]);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshToken: string): Promise<AuthResult> {
  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh-token er ugyldig, utløpt eller tilbakekalt");
  }

  // Token-rotasjon: forrige refresh-token tilbakekalles og en ny utstedes ved hvert bruk,
  // slik at en stjålet token som blir gjenbrukt etter den ekte brukeren avdekkes.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const [accessToken, newRefreshToken] = await Promise.all([
    issueAccessToken(stored.user.id),
    issueRefreshToken(stored.user.id),
  ]);

  return { user: stored.user, accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
