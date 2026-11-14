import { describe, it, expect } from "vitest";
import { GUIDE_SUGGESTIONS, guideAnswer } from "../src/services/guide.js";

describe("guideAnswer", () => {
  it("answers a wallet question in plain English", () => {
    const answer = guideAnswer({ message: "What is a crypto wallet?" });
    expect(answer.content.length).toBeGreaterThan(40);
    expect(answer.suggestions.length).toBeGreaterThan(0);
    expect(answer.lessonSlug).toBeTruthy();
  });

  it("answers in Pidgin when asked", () => {
    const english = guideAnswer({ message: "What is a wallet?", language: "ENGLISH" });
    const pidgin = guideAnswer({ message: "What is a wallet?", language: "PIDGIN" });
    expect(pidgin.content).not.toBe(english.content);
  });

  it("routes scam questions to the scam guidance", () => {
    const answer = guideAnswer({ message: "How can I spot a scam?" });
    expect(answer.intent).toBe("scam");
  });

  it("routes recovery-phrase questions", () => {
    const answer = guideAnswer({ message: "What is a recovery phrase?" });
    expect(answer.intent).toBe("recovery");
  });

  it("falls back to the default answer for an unknown question", () => {
    const answer = guideAnswer({ message: "zzzz qqqq" });
    expect(answer.intent).toBe("default");
    expect(answer.content.length).toBeGreaterThan(20);
  });

  it("never claims to be an AI model", () => {
    const answer = guideAnswer({ message: "What is a wallet?" });
    expect(answer.content.toLowerCase()).not.toContain("i am an ai");
  });

  it("exposes starter suggestions", () => {
    expect(Array.isArray(GUIDE_SUGGESTIONS)).toBe(true);
    expect(GUIDE_SUGGESTIONS.length).toBeGreaterThan(0);
  });
});
