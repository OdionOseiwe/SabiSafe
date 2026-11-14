import { describe, it, expect } from "vitest";
import { SAFETY_TIPS, assessTransfer, scanMessageForScam } from "../src/services/safety.js";

const ALICE = "0x8ba1f109551bd432803012645ac136ddd64dba72";
const BOB = "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed";
const CAROL = "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359";

describe("assessTransfer", () => {
  it("blocks an invalid address", () => {
    const result = assessTransfer({ recipient: "not a wallet", amountEth: "0.001" });
    expect(result.level).toBe("high_risk");
    expect(result.blocking).toBeTruthy();
    expect(result.reasons.map((item) => item.code)).toContain("INVALID_ADDRESS");
  });

  it("blocks the zero address", () => {
    const result = assessTransfer({
      recipient: "0x0000000000000000000000000000000000000000",
      amountEth: "0.001",
    });
    expect(result.level).toBe("high_risk");
    expect(result.reasons.map((item) => item.code)).toContain("INVALID_ADDRESS");
  });

  it("blocks an invalid amount", () => {
    const result = assessTransfer({ recipient: ALICE, amountEth: "0" });
    expect(result.level).toBe("high_risk");
    expect(result.reasons.map((item) => item.code)).toContain("INVALID_AMOUNT");
  });

  it("warns about a large amount", () => {
    const result = assessTransfer({
      recipient: ALICE,
      amountEth: "5000",
      contacts: [{ walletAddress: ALICE }],
      account: { exists: true },
    });
    expect(result.level).toBe("high_risk");
    expect(result.reasons.map((item) => item.code)).toContain("LARGE_AMOUNT");
  });

  it("warns about a new recipient", () => {
    const result = assessTransfer({
      recipient: ALICE,
      amountEth: "0.001",
      contacts: [],
      account: { exists: true },
    });
    expect(result.level).toBe("caution");
    expect(result.reasons.map((item) => item.code)).toContain("NEW_RECIPIENT");
    expect(result.requiresExtraConfirmation).toBe(true);
    expect(result.blocking).toBeNull();
  });

  it("does not warn about a known recipient for a small amount", () => {
    const result = assessTransfer({
      recipient: ALICE,
      amountEth: "0.001",
      contacts: [{ walletAddress: ALICE }],
      account: { exists: true },
    });
    expect(result.level).toBe("info");
    expect(result.requiresExtraConfirmation).toBe(false);
    expect(result.reasons).toHaveLength(0);
  });

  it("matches a saved contact regardless of address case", () => {
    const result = assessTransfer({
      recipient: ALICE,
      amountEth: "0.001",
      contacts: [{ walletAddress: ALICE.toUpperCase().replace("0X", "0x") }],
      account: { exists: true },
    });
    expect(result.reasons.map((item) => item.code)).not.toContain("NEW_RECIPIENT");
  });

  it("notices a self transfer", () => {
    const result = assessTransfer({
      recipient: ALICE,
      amountEth: "0.001",
      contacts: [{ walletAddress: ALICE }],
      ownAddress: ALICE,
      account: { exists: true },
    });
    expect(result.reasons.map((item) => item.code)).toContain("SELF_TRANSFER");
  });

  it("notices a contract recipient", () => {
    const result = assessTransfer({
      recipient: CAROL,
      amountEth: "0.001",
      contacts: [{ walletAddress: CAROL }],
      account: { exists: true, isContract: true },
    });
    expect(result.reasons.map((item) => item.code)).toContain("CONTRACT_RECIPIENT");
  });

  it("flags an address with no activity as a caution, not a block", () => {
    const result = assessTransfer({
      recipient: BOB,
      amountEth: "0.001",
      contacts: [{ walletAddress: BOB }],
      account: { exists: false },
    });
    expect(result.reasons.map((item) => item.code)).toContain("NO_ACTIVITY");
    expect(result.level).toBe("caution");
    expect(result.blocking).toBeNull();
  });

  it("always includes the honesty disclaimer", () => {
    const result = assessTransfer({ recipient: ALICE, amountEth: "0.001", account: { exists: true } });
    expect(result.disclaimer.toLowerCase()).toContain("cannot prove");
  });
});

describe("scanMessageForScam", () => {
  it("flags a classic giveaway scam", () => {
    const result = scanMessageForScam(
      "Congratulations! Pay a small gas fee today or the prize expires in 30 minutes. Send your recovery phrase to claim.",
    );
    expect(result.flagged).toBe(true);
    expect(result.flags).toContain("upfront_fee");
    expect(result.flags).toContain("urgency");
    expect(result.flags).toContain("asks_for_secrets");
  });

  it("flags impossible promises and short links", () => {
    const result = scanMessageForScam("Guaranteed 100% profit, join at bit.ly/abc");
    expect(result.flags).toContain("too_good_to_be_true");
    expect(result.flags).toContain("short_link");
  });

  it("does not flag a normal family message", () => {
    const result = scanMessageForScam("Hello Mum, I sent you small testnet ETH to practise with.");
    expect(result.flagged).toBe(false);
    expect(result.advice.toLowerCase()).toContain("does not guarantee");
  });
});

describe("SAFETY_TIPS", () => {
  it("has stable unique keys and real guidance", () => {
    const keys = SAFETY_TIPS.map((tip) => tip.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const tip of SAFETY_TIPS) {
      expect(tip.title.length).toBeGreaterThan(3);
      expect(tip.body.length).toBeGreaterThan(20);
    }
  });

  it("includes Aurora and EVM-specific guidance", () => {
    const text = SAFETY_TIPS.map((tip) => `${tip.title} ${tip.body}`).join(" ");
    expect(text).toMatch(/Aurora/);
    expect(text).toMatch(/EVM|network/i);
  });
});
