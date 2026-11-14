#!/usr/bin/env bash
#
# Deploy SabiSafeRegistry to Aurora testnet (chain id 1313161555).
#
# Signing happens in your own wallet. Nothing here reads or stores a private key.
#
# Usage:
#   ./deploy.sh --account sabisafe      # encrypted Foundry keystore
#   ./deploy.sh --ledger                # hardware wallet
#   ./deploy.sh --account sabisafe --write-env
#
# Why the extra flags:
#   --skip-simulation  Aurora public RPCs do not implement eth_getProof, which
#                      Forge needs to build its fork. Skipping it avoids that.
#   --legacy           Most Aurora public RPCs do not implement eth_feeHistory,
#                      so EIP-1559 fee estimation fails. Legacy gas price is used.
#
set -euo pipefail

ACCOUNT=""
USE_LEDGER=0
WRITE_ENV=0

usage() {
  sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//' | sed '/^set -euo pipefail$/,$d'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --account)  ACCOUNT="${2:?--account needs a value}"; shift 2 ;;
    --ledger)   USE_LEDGER=1; shift ;;
    --write-env) WRITE_ENV=1; shift ;;
    -h|--help)  usage; exit 0 ;;
    *) echo "error: unknown option '$1'" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$ACCOUNT" && $USE_LEDGER -eq 0 ]]; then
  echo "error: pass --account <keystore-name> or --ledger" >&2
  usage
  exit 1
fi

cd "$(dirname "$0")"

RPCS=(
  "https://testnet.aurora.dev"
  "https://aurora-testnet.rpc.thirdweb.com"
  "https://aurora-testnet.drpc.org"
)

RPC=""
for _ in 1 2 3; do
  for url in "${RPCS[@]}"; do
    if id="$(cast chain-id --rpc-url "$url" 2>/dev/null)" && [[ "$id" == "1313161555" ]]; then
      RPC="$url"
      break 2
    fi
  done
  sleep 2
done

if [[ -z "$RPC" ]]; then
  echo "error: no Aurora testnet RPC responded with chain id 1313161555" >&2
  echo "Tried: ${RPCS[*]}" >&2
  exit 1
fi
echo "RPC:      $RPC"

if [[ $USE_LEDGER -eq 1 ]]; then
  SENDER="$(cast wallet address --ledger 2>/dev/null || true)"
else
  SENDER="$(cast wallet address --account "$ACCOUNT" 2>/dev/null || true)"
fi

if [[ -z "$SENDER" ]]; then
  echo "error: could not resolve a signer address." >&2
  if [[ $USE_LEDGER -eq 0 ]]; then
    echo "Create the keystore first:  cast wallet import $ACCOUNT --interactive" >&2
  else
    echo "Unlock your Ledger and open the Ethereum app." >&2
  fi
  exit 1
fi
echo "Signer:   $SENDER"

BAL="$(cast balance "$SENDER" --rpc-url "$RPC" 2>/dev/null || echo 0)"
BAL_ETH="$(cast to-unit "$BAL" ether 2>/dev/null || echo "?")"
echo "Balance:  $BAL_ETH ETH"

if [[ "$BAL" == "0" ]]; then
  echo >&2
  echo "error: signer has no Aurora testnet ETH." >&2
  echo "Fund $SENDER at https://aurora.dev/faucet, then re-run this script." >&2
  exit 1
fi

GAS_PRICE="$(cast gas-price --rpc-url "$RPC" 2>/dev/null || echo 0)"
[[ "$GAS_PRICE" == "0" || -z "$GAS_PRICE" ]] && GAS_PRICE=70000000
echo "Gas price: $GAS_PRICE wei"
echo

ARGS=(--rpc-url "$RPC" --broadcast --skip-simulation --legacy
      --with-gas-price "$GAS_PRICE" --timeout 300 --sender "$SENDER")
if [[ $USE_LEDGER -eq 1 ]]; then
  ARGS+=(--ledger)
else
  ARGS+=(--account "$ACCOUNT")
fi

forge script script/Deploy.s.sol "${ARGS[@]}"

RUN_JSON="broadcast/Deploy.s.sol/1313161555/run-latest.json"
if [[ ! -f "$RUN_JSON" ]]; then
  echo
  echo "warning: broadcast file $RUN_JSON not found; check the output above." >&2
  exit 0
fi

read -r ADDRESS TX_HASH < <(python3 - "$RUN_JSON" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
for tx in data.get("transactions", []):
    if tx.get("transactionType") == "CREATE" and tx.get("contractName") == "SabiSafeRegistry":
        print(tx.get("contractAddress", ""), tx.get("hash", ""))
        break
PY
)

if [[ -z "${ADDRESS:-}" ]]; then
  echo
  echo "warning: could not find SabiSafeRegistry CREATE entry in $RUN_JSON" >&2
  exit 0
fi

echo
echo "============================================================"
echo "SabiSafeRegistry deployed"
echo "  address: $ADDRESS"
echo "  tx:      $TX_HASH"
echo "  explorer: https://explorer.aurora.dev/address/$ADDRESS"
echo "============================================================"

if [[ $WRITE_ENV -eq 1 ]]; then
  ENV_FILE="../server/.env"
  if [[ -f "$ENV_FILE" ]]; then
    if grep -q '^AURORA_REGISTRY_ADDRESS=' "$ENV_FILE"; then
      tmp="$(mktemp)"
      sed "s|^AURORA_REGISTRY_ADDRESS=.*|AURORA_REGISTRY_ADDRESS=$ADDRESS|" "$ENV_FILE" > "$tmp"
      mv "$tmp" "$ENV_FILE"
    else
      printf '\nAURORA_REGISTRY_ADDRESS=%s\n' "$ADDRESS" >> "$ENV_FILE"
    fi
    echo "Updated AURORA_REGISTRY_ADDRESS in $ENV_FILE"
  else
    echo "warning: $ENV_FILE not found; set AURORA_REGISTRY_ADDRESS manually." >&2
  fi
fi
