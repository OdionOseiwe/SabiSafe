import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/validate.js";
import { requestId } from "./middleware/auth.js";
import { generalLimiter } from "./middleware/rateLimit.js";
import { AppError } from "./utils/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");

export const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const allowedOrigins = new Set(
  [
    env.clientUrl,
    ...(process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()),
    ...(env.isProd
      ? []
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5173",
          "http://localhost:5273",
          "http://127.0.0.1:5273",
          "http://localhost:4173",
        ]),
  ].filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new AppError(403, "CORS_BLOCKED", "This origin is not allowed to call the API."));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: false, limit: "64kb" }));
app.use(requestId);

if (!env.isProd) {
  app.use(
    morgan(":method :url :status :response-time ms", {
      skip: (req) => req.originalUrl === "/api/health",
    }),
  );
}

app.use("/api", generalLimiter, routes);

app.use("/api", (_req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "That API route does not exist." },
  });
});

// Serve the built client from the same service when it exists (single-service deploy).
const clientDist = path.resolve(serverRoot, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: "1h", index: false }));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Payload errors and anything else.
app.use((error, req, res, next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      error: { code: "PAYLOAD_TOO_LARGE", message: "That request is too large.", requestId: req.id },
    });
  }
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "The request body was not valid JSON.", requestId: req.id },
    });
  }
  return errorHandler(error, req, res, next);
});

export default app;
