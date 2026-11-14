import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

/**
 * The database is optional at boot so the UI can be developed before a
 * connection string is available. Any real query then fails with a clear 503
 * instead of crashing the process.
 */
function unavailableClient(reason) {
  const makeStub = () =>
    new Proxy(function databaseStub() {}, {
      get(_target, property) {
        // Keep the stub from looking like a promise or a stringifier.
        if (typeof property === "symbol") return undefined;
        if (property === "then" || property === "toJSON") return undefined;
        return makeStub();
      },
      apply() {
        throw new AppError(503, "DATABASE_NOT_CONFIGURED", reason);
      },
    });
  return makeStub();
}

let prisma;

if (!env.databaseUrl) {
  prisma = unavailableClient(
    "The database is not configured yet. Add DATABASE_URL to the server environment and restart.",
  );
  logger.warn("DATABASE_URL is not set; database routes will return 503.");
} else {
  try {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient({
      log: env.isProd ? ["error"] : ["error", "warn"],
    });
  } catch (error) {
    prisma = unavailableClient(
      "The database client is not generated yet. Run `npm run db:generate` and restart.",
    );
    logger.error("Prisma client could not be loaded", { reason: error?.message });
  }
}

export { prisma };
