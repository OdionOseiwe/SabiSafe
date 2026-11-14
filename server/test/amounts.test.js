import { describe, it, expect } from "vitest";
import {
  WEI_PER_ETH,
  compareWei,
  ethToWei,
  formatEth,
  isValidEvmAddress,
  isZeroAddress,
  weiToEth,
} from "../src/utils/amounts.js";

describe("ethToWei", () => {
  it("converts whole ETH exactly", () => {
    expect(ethToWei("1")).toBe(WEI_PER_ETH.toString());
  });

  it("converts fractional ETH without floating point drift", () => {
    expect(ethToWei("0.1")).toBe("100000000000000000");
    expect(ethToWei("0.000000000000000001")).toBe("1");
    expect(ethToWei("1.5")).toBe("1500000000000000000");
  });

  it("accepts commas and surrounding spaces", () => {
    expect(ethToWei(" 1,000 ")).toBe("1000000000000000000000");
  });

  it("rejects malformed amounts instead of guessing", () => {
    for (const bad of ["", "-1", "abc", "1.2.3", "1.", "1e3", "0", "0.0", "  "]) {
      expect(() => ethToWei(bad)).toThrow();
    }
  });

  it("rejects more than 18 decimal places", () => {
    expect(() => ethToWei("0.0000000000000000001")).toThrow();
  });
});

describe("weiToEth / formatEth", () => {
  it("round-trips a wei amount", () => {
    const wei = ethToWei("0.123456");
    expect(weiToEth(wei)).toBe("0.123456");
  });

  it("trims trailing zeroes", () => {
    expect(weiToEth("1000000000000000000")).toBe("1");
  });

  it("formats with grouped thousands", () => {
    expect(formatEth(ethToWei("1234.5"))).toBe("1,234.5");
  });

  it("returns 0 for invalid input rather than throwing", () => {
    expect(weiToEth("not-a-number")).toBe("0");
  });
});

describe("compareWei", () => {
  it("compares large exact strings", () => {
    expect(compareWei("1000000000000000000", "999999999999999999")).toBe(1);
    expect(compareWei("5", "5")).toBe(0);
    expect(compareWei("1", "2")).toBe(-1);
  });
});

describe("EVM address validation", () => {
  it("accepts a lowercase address", () => {
    expect(isValidEvmAddress("0x8ba1f109551bd432803012645ac136ddd64dba72")).toBe(true);
  });

  it("accepts a valid EIP-55 checksummed address", () => {
    expect(isValidEvmAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed")).toBe(true);
  });

  it("rejects a mixed-case address with a broken checksum", () => {
    expect(isValidEvmAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAeD")).toBe(false);
  });

  it("rejects malformed addresses", () => {
    for (const bad of [
      "",
      "ada.testnet",
      "0x123",
      "8ba1f109551bd432803012645ac136ddd64dba72",
      "0x8ba1f109551bd432803012645ac136ddd64dba7z",
      "0x8ba1f109551bd432803012645ac136ddd64dba720",
    ]) {
      expect(isValidEvmAddress(bad)).toBe(false);
    }
  });

  it("detects the zero address", () => {
    expect(isZeroAddress("0x0000000000000000000000000000000000000000")).toBe(true);
    expect(isZeroAddress("0x0000000000000000000000000000000000000001")).toBe(false);
  });
});
