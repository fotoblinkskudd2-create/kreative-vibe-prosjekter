import type { NextFunction, Request, Response } from "express";
import { env } from "../../lib/env.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import * as authService from "./auth.service.js";
import { UnauthorizedError } from "../../lib/errors.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api/auth",
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);
    res.status(201).json({ user: result.user, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);
    res.status(200).json({ user: result.user, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      throw new UnauthorizedError("Mangler refresh-token");
    }
    const result = await authService.refresh(token);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);
    res.status(200).json({ user: result.user, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
