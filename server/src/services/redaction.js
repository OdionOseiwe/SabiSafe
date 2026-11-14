// Local redaction used before anything is written to the database.
// This is deliberately conservative: it is better to remove a little extra
// than to store a phone number, wallet address, or private key.

const RULES = [
  // Recovery phrases are never stored. Catch 12+ consecutive short words.
  {
    name: "possible_recovery_phrase",
    pattern: /\b(?:[a-z]{3,10}\s+){11,23}[a-z]{3,10}\b/gi,
    replace: "[recovery phrase removed]",
  },
  // Email addresses
  {
    name: "email",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replace: "[email removed]",
  },
  // EVM wallet addresses (0x followed by 40 hex characters)
  {
    name: "evm_address",
    pattern: /\b0x[0-9a-f]{40}\b/gi,
    replace: "[wallet address removed]",
  },
  // EVM transaction hashes (0x followed by 64 hex characters)
  {
    name: "evm_tx_hash",
    pattern: /\b0x[0-9a-f]{64}\b/gi,
    replace: "[transaction hash removed]",
  },
  // International and Nigerian phone numbers
  {
    name: "phone",
    pattern: /(?:\+?\d[\d\s().-]{7,}\d)/g,
    replace: "[phone number removed]",
  },
  // Long card-like or identifier-like digit runs
  {
    name: "long_number",
    pattern: /\b\d{9,}\b/g,
    replace: "[number removed]",
  },
  // Private key / seed style hex blobs
  {
    name: "hex_secret",
    pattern: /\b(?:0x)?[0-9a-f]{40,}\b/gi,
    replace: "[secret removed]",
  },
];

export function redactText(input) {
  let text = String(input ?? "");
  const found = new Set();
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      found.add(rule.name);
      text = text.replace(rule.pattern, rule.replace);
    }
    rule.pattern.lastIndex = 0;
  }
  return { text, redacted: found.size > 0, rules: [...found] };
}

/**
 * Detect a message that appears to contain secrets the assistant must never receive.
 * We block these before they reach any model or log.
 */
export function detectSecretSharing(input) {
  const text = String(input ?? "");
  const reasons = [];

  if (/\b(?:seed|recovery|secret)\s*(?:phrase|words)\b/i.test(text)) {
    reasons.push("recovery_phrase_mentioned");
  }
  if (/\b(?:private\s*key|secret\s*key|keystore|json\s*key)\b/i.test(text)) {
    reasons.push("private_key_mentioned");
  }
  if (/\b(?:one[- ]?time\s*(?:code|password)|otp|verification\s*code)\b/i.test(text)) {
    reasons.push("otp_mentioned");
  }
  if (/\b(?:[a-z]{3,10}\s+){11,23}[a-z]{3,10}\b/i.test(text)) {
    reasons.push("possible_word_list");
  }
  if (/\b(?:0x)?[0-9a-f]{64}\b/i.test(text) && /\b(?:key|secret|phrase)\b/i.test(text)) {
    reasons.push("possible_hex_secret");
  }

  return { blocked: reasons.length > 0, reasons };
}

export const SECRET_REFUSAL =
  "Stop for a moment. Please do not share a recovery phrase, private key, OTP, or PIN with me or with anyone. SabiSafe will never ask for them.\n\nIf you already shared it somewhere, move your funds to a fresh wallet with a new recovery phrase and ask someone you trust to help you. I can still explain how wallets work without seeing any secret.";
