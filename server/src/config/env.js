import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "../..");
const repoRoot = path.resolve(serverRoot, "..");

// Support running from the repo root or from the server workspace.
// The root file is loaded first, then server/.env overrides it, so the server
// workspace file is always authoritative and the two can never disagree.
dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });
dotenv.config({ path: path.join(serverRoot, ".env"), quiet: true, override: true });

const isProd = process.env.NODE_ENV === "production";
const bool = (value, fallback = false) => {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};
const int = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

if (!process.env.JWT_SECRET) {
  if (isProd) {
    throw new Error("JWT_SECRET is required in production");
  }
  process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
  console.warn("[config] JWT_SECRET was not set. Using a temporary development secret.");
}

if (!process.env.DATABASE_URL) {
  console.warn("[config] DATABASE_URL is not set. Database routes will fail until it is configured.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd,
  port: int(process.env.PORT, isProd ? 10000 : 3001),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieSecure: bool(process.env.COOKIE_SECURE, isProd),
  cookieSameSite: ["lax", "strict", "none"].includes(String(process.env.COOKIE_SAME_SITE || "").toLowerCase())
    ? String(process.env.COOKIE_SAME_SITE).toLowerCase()
    : "lax",

  nearAi: {
    apiKey: process.env.NEAR_AI_API_KEY || "",
    baseUrl: process.env.NEAR_AI_BASE_URL || "https://cloud-api.near.ai/v1",
    model: process.env.NEAR_AI_MODEL || "z-ai/glm-5.3-flash",
    signingAlgo: process.env.NEAR_AI_SIGNING_ALGO || "ed25519",
    e2ee: bool(process.env.NEAR_AI_E2EE, true),
    verifyResponses: bool(process.env.NEAR_AI_VERIFY_RESPONSES, true),
    privateByDefault: bool(process.env.NEAR_AI_PRIVATE_BY_DEFAULT, true),
    redactBeforeSave: bool(process.env.NEAR_AI_REDACT_BEFORE_SAVE, true),
    maxOutputTokens: int(process.env.NEAR_AI_MAX_OUTPUT_TOKENS, 900),
  },

  aurora: {
    network: "aurora-testnet",
    chainId: int(process.env.AURORA_CHAIN_ID, 1313161555),
    rpcUrl: process.env.AURORA_RPC_URL || "https://testnet.aurora.dev",
    registryAddress: process.env.AURORA_REGISTRY_ADDRESS || "",
    explorerUrl: process.env.AURORA_EXPLORER_URL || "https://explorer.aurora.dev",
    activityUrl: process.env.AURORA_ACTIVITY_URL || "https://explorer.aurora.dev/api/v2",
    faucetUrl: process.env.AURORA_FAUCET_URL || "https://aurora.dev/faucet",
  },

  safety: {
    largeAmountEth: Number.parseFloat(process.env.TRANSACTION_LARGE_AMOUNT_ETH || "0.01"),
  },

  aiRateLimit: {
    windowMinutes: int(process.env.AI_RATE_LIMIT_WINDOW_MINUTES, 10),
    max: int(process.env.AI_RATE_LIMIT_MAX, 30),
  },

  // Some home, office, and VPN resolvers cannot resolve the third-party hosts
  // used to verify NEAR AI's hardware proof. When the system resolver fails for
  // these hosts only, retry with public DNS. Set DNS_FALLBACK_HOSTS to an empty
  // string to switch this off entirely.
  dns: {
    fallbackHosts:
      process.env.DNS_FALLBACK_HOSTS ??
      "nras.attestation.nvidia.com,api.trustedservices.intel.com",
    fallbackServers: process.env.DNS_FALLBACK_SERVERS || "1.1.1.1,8.8.8.8",
  },
};

export const publicConfig = {
  network: env.aurora.network,
  chainId: env.aurora.chainId,
  contractId: env.aurora.registryAddress || null,
  explorerUrl: env.aurora.explorerUrl,
  faucetUrl: env.aurora.faucetUrl,
  ai: {
    configured: Boolean(env.nearAi.apiKey),
    provider: "NEAR AI Cloud",
    model: env.nearAi.model,
    privateByDefault: env.nearAi.privateByDefault,
    verificationEnabled: env.nearAi.verifyResponses,
  },
};
