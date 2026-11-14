import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const message = {
  error: {
    code: "RATE_LIMITED",
    message: "Please wait a moment and try again.",
  },
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 400,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many sign-in attempts. Please wait 15 minutes and try again.",
    },
  },
});

export const aiLimiter = rateLimit({
  windowMs: env.aiRateLimit.windowMinutes * 60 * 1000,
  limit: env.aiRateLimit.max,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "You have asked a lot of questions. Please take a short break and try again.",
    },
  },
});

export const transactionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message,
});
