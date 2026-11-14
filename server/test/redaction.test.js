import { describe, it, expect } from "vitest";
import { SECRET_REFUSAL, detectSecretSharing, redactText } from "../src/services/redaction.js";

const ADDRESS = "0x8ba1f109551bd432803012645ac136ddd64dba72";
const TX_HASH = `0x${"a1".repeat(32)}`;

describe("detectSecretSharing", () => {
  it("blocks a message that mentions a recovery phrase", () => {
    const result = detectSecretSharing("Here is my recovery phrase, is it safe?");
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("recovery_phrase_mentioned");
  });

  it("blocks a 12-word recovery phrase even without a label", () => {
    const words = "apple banana cherry orange mango guava pawpaw peach plum berry lime lemon";
    const result = detectSecretSharing(`What about ${words}`);
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("possible_word_list");
  });

  it("blocks private keys, keystores, and OTPs", () => {
    expect(detectSecretSharing("my private key is 0xdeadbeef").blocked).toBe(true);
    expect(detectSecretSharing("I downloaded a keystore file").blocked).toBe(true);
    expect(detectSecretSharing("the OTP was 123456").blocked).toBe(true);
  });

  it("does not block ordinary learning questions", () => {
    expect(detectSecretSharing("What is a crypto wallet?").blocked).toBe(false);
    expect(detectSecretSharing("How do I receive money?").blocked).toBe(false);
    expect(detectSecretSharing("How can I spot a scam?").blocked).toBe(false);
  });

  it("does not treat a public 0x address as a secret", () => {
    expect(detectSecretSharing(`Is ${ADDRESS} a wallet address?`).blocked).toBe(false);
  });

  it("always refuses to help share secrets", () => {
    expect(SECRET_REFUSAL.toLowerCase()).toContain("do not share");
    expect(SECRET_REFUSAL.toLowerCase()).toContain("recovery phrase");
  });
});

describe("redactText", () => {
  it("removes email addresses", () => {
    const result = redactText("Write to ada@example.com about it");
    expect(result.text).not.toContain("ada@example.com");
    expect(result.redacted).toBe(true);
    expect(result.rules).toContain("email");
  });

  it("removes EVM wallet addresses", () => {
    const result = redactText(`send to ${ADDRESS} today`);
    expect(result.text).not.toContain(ADDRESS);
    expect(result.text).toContain("[wallet address removed]");
    expect(result.rules).toContain("evm_address");
  });

  it("removes EVM transaction hashes", () => {
    const result = redactText(`hash ${TX_HASH} succeeded`);
    expect(result.text).not.toContain(TX_HASH);
    expect(result.text).toContain("[transaction hash removed]");
    expect(result.rules).toContain("evm_tx_hash");
  });

  it("removes phone numbers", () => {
    const result = redactText("Call me on +234 801 234 5678");
    expect(result.text).not.toContain("801");
    expect(result.rules).toContain("phone");
  });

  it("removes a probable recovery phrase", () => {
    const words = "apple banana cherry orange mango guava pawpaw peach plum berry lime lemon";
    const result = redactText(`Please remember ${words}`);
    expect(result.text).toContain("[recovery phrase removed]");
    expect(result.rules).toContain("possible_recovery_phrase");
  });

  it("leaves harmless text unchanged", () => {
    const result = redactText("A wallet is a place to keep your money safe.");
    expect(result.redacted).toBe(false);
    expect(result.text).toBe("A wallet is a place to keep your money safe.");
  });

  it("handles missing input safely", () => {
    expect(redactText(undefined)).toEqual({ text: "", redacted: false, rules: [] });
  });
});
