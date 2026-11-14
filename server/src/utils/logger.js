const sensitive = /(authorization|cookie|password|secret|token|api[_-]?key|private[_-]?key|recovery|phrase)/i;

function clean(meta) {
  if (!meta || typeof meta !== "object") return meta;
  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [key, sensitive.test(key) ? "[redacted]" : value]),
  );
}

function emit(level, message, meta) {
  const line = {
    time: new Date().toISOString(),
    level,
    message,
    ...(meta ? clean(meta) : {}),
  };
  const target = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  target(JSON.stringify(line));
}

export const logger = {
  info: (message, meta) => emit("info", message, meta),
  warn: (message, meta) => emit("warn", message, meta),
  error: (message, meta) => emit("error", message, meta),
};
