import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./lib/prisma.js";
import { installDnsFallback } from "./lib/dnsFallback.js";

// Install before the server starts handling requests so attestation downloads
// can survive a resolver that blocks NVIDIA or Intel.
const dnsFallback = installDnsFallback();

const server = app.listen(env.port, () => {
  logger.info("SabiSafe API listening", {
    port: env.port,
    environment: env.nodeEnv,
    network: env.aurora.network,
    chainId: env.aurora.chainId,
    aiConfigured: Boolean(env.nearAi.apiKey),
    databaseConfigured: Boolean(env.databaseUrl),
    registry: env.aurora.registryAddress || "not deployed",
    dnsFallback: dnsFallback.installed ? dnsFallback.hosts.join(",") : "off",
  });
});

async function shutdown(signal) {
  logger.info("Shutting down", { signal });
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // Nothing to disconnect.
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", { reason: reason?.message || String(reason) });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { reason: error?.message });
  shutdown("uncaughtException");
});
