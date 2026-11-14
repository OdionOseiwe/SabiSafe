import dns from "node:dns";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// NEAR AI response verification downloads hardware evidence from two hosts that
// are not operated by NEAR AI:
//   - nras.attestation.nvidia.com  (GPU attestation keys)
//   - api.trustedservices.intel.com (Intel TDX quote collateral)
//
// Some home routers, office networks, and VPN resolvers fail to resolve them
// even when general internet access works. That used to surface as a generic
// "Connection error." with no explanation.
//
// This patches dns.lookup so that, for the configured hosts only, a failed
// system lookup is retried against public DNS. It never changes behaviour when
// the system resolver works, and it never applies to any other hostname.

let installed = false;

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function installDnsFallback() {
  if (installed) return { installed: false, hosts: [] };

  const hosts = parseList(env.dns.fallbackHosts);
  if (!hosts.length) return { installed: false, hosts: [] };

  const servers = parseList(env.dns.fallbackServers);
  const hostSet = new Set(hosts);
  const resolver = new dns.promises.Resolver({ timeout: 5_000, tries: 2 });
  if (servers.length) resolver.setServers(servers);

  const originalLookup = dns.lookup;

  function lookupWithFallback(hostname, options, callback) {
    let opts = options;
    let cb = callback;
    if (typeof options === "function") {
      cb = options;
      opts = {};
    }
    if (typeof opts === "number") opts = { family: opts };
    opts = opts || {};

    if (!hostSet.has(hostname)) return originalLookup.call(dns, hostname, opts, cb);

    originalLookup.call(dns, hostname, opts, (error, address, family) => {
      if (!error) return cb(null, address, family);

      const wantsIpv6 = opts.family === 6;
      const query = wantsIpv6 ? "resolve6" : "resolve4";

      resolver[query](hostname)
        .then((addresses) => {
          if (!addresses?.length) throw new Error("no addresses returned");
          logger.warn("System DNS failed; used public DNS for attestation host", {
            host: hostname,
            servers: servers.join(",") || "system",
            reason: error.code || error.message,
          });
          if (opts.all) {
            return cb(
              null,
              addresses.map((value) => ({ address: value, family: wantsIpv6 ? 6 : 4 })),
            );
          }
          return cb(null, addresses[0], wantsIpv6 ? 6 : 4);
        })
        .catch((fallbackError) => {
          logger.warn("Public DNS fallback also failed", {
            host: hostname,
            reason: fallbackError?.code || fallbackError?.message,
          });
          cb(error);
        });
    });
  }

  dns.lookup = lookupWithFallback;
  installed = true;
  return { installed: true, hosts, servers };
}
