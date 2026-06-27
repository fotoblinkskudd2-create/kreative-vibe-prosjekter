import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
} from "./auth.controller.js";

const router = Router();

// Bremser credential stuffing / brute-force mot innlogging og registrering.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, registerHandler);
router.post("/login", authLimiter, loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);

export default router;
