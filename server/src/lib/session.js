import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const AUTH_COOKIE = "sabisafe_session";

export function signSessionToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: "sabisafe",
    audience: "sabisafe-web",
  });
}

export function verifySessionToken(token) {
  return jwt.verify(token, env.jwtSecret, {
    issuer: "sabisafe",
    audience: "sabisafe-web",
  });
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function newRequestId() {
  return crypto.randomUUID();
}
