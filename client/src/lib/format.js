const WEI = 10n ** 18n;

export function ethToWei(value) {
  const raw = String(value ?? "").trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,18})?$/.test(raw)) throw new Error("Enter an amount using numbers only.");
  const [whole, fraction = ""] = raw.split(".");
  const wei = BigInt(whole) * WEI + BigInt(fraction.padEnd(18, "0"));
  if (wei <= 0n) throw new Error("The amount must be more than zero.");
  return wei.toString();
}

export function weiToEth(value, maxDecimals = 6) {
  try {
    const wei = BigInt(String(value ?? "0"));
    const whole = wei / WEI;
    const fraction = (wei % WEI).toString().padStart(18, "0").slice(0, maxDecimals).replace(/0+$/, "");
    return fraction ? `${whole}.${fraction}` : whole.toString();
  } catch {
    return "0";
  }
}

export function formatEth(value, maxDecimals = 6) {
  const eth = weiToEth(value, maxDecimals);
  const [whole, fraction] = eth.split(".");
  let grouped;
  try {
    grouped = BigInt(whole).toLocaleString("en-NG");
  } catch {
    grouped = whole;
  }
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export function isEvmAddress(value) {
  return /^0x[0-9a-fA-F]{40}$/.test(String(value || "").trim());
}

export function shortAddress(value, head = 8, tail = 6) {
  if (!value) return "";
  const text = String(value);
  if (text.length <= head + tail + 1) return text;
  return `${text.slice(0, head)}…${text.slice(-tail)}`;
}

export function formatDate(value, options = {}) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function relativeDate(value) {
  if (!value) return "";
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function classForLevel(level) {
  if (level === "high_risk") return "border-clay/30 bg-clay-soft text-clay";
  if (level === "caution") return "border-gold/50 bg-gold-soft text-[#8a5a10]";
  return "border-leaf/20 bg-mint text-leaf";
}

export function statusTone(status) {
  if (status === "CONFIRMED") return "bg-mint text-leaf border-leaf/20";
  if (status === "FAILED") return "bg-clay-soft text-clay border-clay/20";
  return "bg-gold-soft text-[#8a5a10] border-gold/40";
}
