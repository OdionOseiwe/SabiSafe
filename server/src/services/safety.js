import { isValidEvmAddress, isZeroAddress, ethToWei } from "../utils/amounts.js";
import { env } from "../config/env.js";

const LEVEL_WEIGHT = { info: 0, caution: 1, high_risk: 2 };

function reason(code, level, title, message, action) {
  return { code, level, title, message, ...(action ? { action } : {}) };
}

/**
 * Pure, testable transfer assessment. Chain facts are passed in by the caller.
 * Returned level is the highest severity found.
 */
export function assessTransfer({
  recipient,
  amountEth,
  contacts = [],
  ownAddress = null,
  account = null,
  amountWei = null,
}) {
  const reasons = [];
  const checks = [];

  const validAddress = isValidEvmAddress(recipient) && !isZeroAddress(recipient);
  checks.push({
    key: "address_format",
    label: "Wallet address format",
    passed: validAddress,
    detail: validAddress
      ? "This looks like a valid EVM address."
      : "An Aurora wallet address starts with 0x followed by 40 hexadecimal characters.",
  });
  if (!validAddress) {
    reasons.push(
      reason(
        "INVALID_ADDRESS",
        "high_risk",
        "This address is not valid",
        "An Aurora address starts with 0x and has 40 characters after it. Check for spaces, missing characters, or a different network's address.",
        "Do not send until the address is correct.",
      ),
    );
    return finish(reasons, checks);
  }

  let wei = amountWei;
  if (!wei) {
    try {
      wei = ethToWei(amountEth);
    } catch {
      reasons.push(
        reason(
          "INVALID_AMOUNT",
          "high_risk",
          "The amount needs checking",
          "Enter an amount greater than zero, using numbers only.",
          "Fix the amount before continuing.",
        ),
      );
      return finish(reasons, checks);
    }
  }

  checks.push({
    key: "amount",
    label: "Amount",
    passed: true,
    detail: "The amount is a valid positive ETH amount.",
  });

  if (ownAddress && recipient.toLowerCase() === ownAddress.toLowerCase()) {
    reasons.push(
      reason(
        "SELF_TRANSFER",
        "caution",
        "This is your own address",
        "Sending to yourself will waste a network fee and will not move your money to anyone else.",
      ),
    );
  }

  if (account?.isContract) {
    checks.push({
      key: "account_type",
      label: "Account type",
      passed: true,
      detail: "This address belongs to a smart contract, not a person's wallet.",
    });
    reasons.push(
      reason(
        "CONTRACT_RECIPIENT",
        "caution",
        "This is a smart contract",
        "This address is controlled by a contract. Make sure you know what the contract will do with the money.",
      ),
    );
  } else {
    checks.push({
      key: "account_type",
      label: "Account type",
      passed: true,
      detail: "This is a regular wallet address.",
    });
  }

  // On EVM chains every address is valid even before it is used. Zero activity is
  // therefore only a hint, not proof that the address is wrong.
  if (account && account.exists === false) {
    checks.push({
      key: "account_activity",
      label: "Address has been used before",
      passed: false,
      detail: "No balance or outgoing transaction was found at this address yet.",
    });
    reasons.push(
      reason(
        "NO_ACTIVITY",
        "caution",
        "This address has no activity yet",
        "That can be normal for a brand-new wallet. It can also mean a character is wrong. Confirm the whole address with the person using a call or a message you already trust.",
        "Send a small test amount first, or ask the person to confirm the address.",
      ),
    );
  } else if (account && account.exists === true) {
    checks.push({
      key: "account_activity",
      label: "Address has been used before",
      passed: true,
      detail: "This address has a balance or has sent a transaction before.",
    });
  }

  const known = contacts.some(
    (contact) => String(contact.walletAddress).toLowerCase() === recipient.toLowerCase(),
  );
  checks.push({
    key: "known_contact",
    label: "Saved contact",
    passed: known,
    detail: known
      ? "This address is saved in your trusted contacts."
      : "This address is not in your trusted contacts yet.",
  });
  if (!known) {
    reasons.push(
      reason(
        "NEW_RECIPIENT",
        "caution",
        "This is a new recipient",
        "You have not saved this address before. Confirm it with the person using a call or a message you already trust, not a link they just sent.",
        "Check the address with the person before approving.",
      ),
    );
  }

  const largeThreshold = env.safety.largeAmountEth;
  const amountEthNumber = Number(amountEth);
  if (Number.isFinite(amountEthNumber) && amountEthNumber >= largeThreshold) {
    reasons.push(
      reason(
        "LARGE_AMOUNT",
        "high_risk",
        "This is a large amount",
        `You are about to send ${amountEth} ETH, which is at or above the ${largeThreshold} ETH safety limit. Take a moment and check everything twice.`,
        "Ask a trusted family member to review this payment with you.",
      ),
    );
  }

  if (reasons.length === 0) {
    checks.push({
      key: "risk_review",
      label: "Safety review",
      passed: true,
      detail: "No warnings were found by the automatic checks.",
    });
  }

  return finish(reasons, checks);
}

function finish(reasons, checks) {
  const level = reasons.reduce(
    (highest, item) => (LEVEL_WEIGHT[item.level] > LEVEL_WEIGHT[highest] ? item.level : highest),
    "info",
  );
  const highRisk = reasons.some((item) => item.level === "high_risk");
  return {
    level,
    headline:
      level === "high_risk"
        ? "Please stop and check this payment"
        : level === "caution"
          ? "A few things to check"
          : "No warnings found",
    reasons,
    checks,
    requiresExtraConfirmation: level !== "info",
    blocking: highRisk
      ? "This payment has a serious warning. SabiSafe will not help you send it until the warning is resolved."
      : null,
    disclaimer:
      "These checks can spot common mistakes, but they cannot prove that a recipient is honest or that a payment is safe.",
  };
}

/** Plain-language safety tips shown in the Safety Centre. */
export const SAFETY_TIPS = [
  {
    key: "never-share-secrets",
    level: "high_risk",
    title: "Never share your recovery phrase",
    body: "Those 12 or 24 words can restore your whole wallet. No support agent, giveaway, or family member needs them. SabiSafe will never ask for them.",
  },
  {
    key: "confirm-address",
    level: "caution",
    title: "Read the whole address",
    body: "Scammers use addresses that look almost identical to a real one. Check the first and last six characters with the person, then send a small test amount first.",
  },
  {
    key: "no-upfront-fees",
    level: "high_risk",
    title: "Prizes never need an upfront fee",
    body: "If someone says you must pay a fee, tax, or gas before receiving a prize or a big transfer, it is almost always a scam.",
  },
  {
    key: "urgency",
    level: "caution",
    title: "Slow down when someone rushes you",
    body: "Urgency is a common trick. Hang up, take a breath, and talk to a family member before you send anything.",
  },
  {
    key: "testnet-first",
    level: "info",
    title: "Practise on testnet",
    body: "Aurora testnet ETH has no real value. Practise receiving, sending, and checking a transaction here before you use mainnet money.",
  },
  {
    key: "wrong-network",
    level: "caution",
    title: "Send on the right network",
    body: "Aurora is an EVM network. An address copied from Ethereum or another EVM chain can look valid, but the money must be sent on the same network. SabiSafe always shows Aurora testnet.",
  },
  {
    key: "verify-ai",
    level: "info",
    title: "Check the green verification panel",
    body: "The panel proves where an AI answer was processed. It does not prove the answer is correct. Always check money facts with the official Aurora docs or a trusted person.",
  },
];

/** Detect suspicious phrases in an inbound message the user shares with us. */
export function scanMessageForScam(text) {
  const value = String(text || "").toLowerCase();
  const flags = [];
  if (/(recovery|seed|secret)\s*(phrase|words)|private key|keystore/.test(value)) {
    flags.push("asks_for_secrets");
  }
  if (/(pay|send|transfer).{0,40}(fee|tax|gas|charge)|processing fee/.test(value)) {
    flags.push("upfront_fee");
  }
  if (/(urgent|immediately|within \d+ (minutes|hours)|expires? (in|soon|today)|last chance|act now)/.test(value)) {
    flags.push("urgency");
  }
  if (/(bit\.ly|tinyurl|t\.me|wa\.me\/\+?\d)/.test(value)) {
    flags.push("short_link");
  }
  if (/(guaranteed|double your|risk[- ]free|100% profit)/.test(value)) {
    flags.push("too_good_to_be_true");
  }
  return {
    flagged: flags.length > 0,
    flags,
    advice:
      flags.length > 0
        ? "This message uses patterns common in scams. Do not send money, do not share secrets, and check with someone you trust."
        : "No common scam patterns were found. That does not guarantee the message is safe.",
  };
}
