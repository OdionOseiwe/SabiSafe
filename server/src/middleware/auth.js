import crypto from "node:crypto";
import { verifySessionToken, AUTH_COOKIE } from "../lib/session.js";
import { unauthorized } from "../utils/errors.js";

export function requireAuth(req, res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = req.cookies?.[AUTH_COOKIE] || bearer;
    if (!token) throw unauthorized();
    const payload = verifySessionToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    next(unauthorized("Your session has expired. Please sign in again."));
  }
}

export function optionalAuth(req, _res, next) {
  try {
    const token = req.cookies?.[AUTH_COOKIE];
    if (token) {
      const payload = verifySessionToken(token);
      req.userId = payload.sub;
    }
  } catch {
    req.userId = undefined;
  }
  next();
}

export function requestId(req, res, next) {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}
