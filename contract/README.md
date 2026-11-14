# SabiSafe trusted-recipient registry

A small Solidity contract on **Aurora testnet** that stores, for each wallet
address, a public list of recipient addresses that wallet has approved.

SabiSafe uses it as an optional second signal. A local contact is a convenience;
an onchain registry entry is proof that the wallet owner signed an approval
transaction for that address.

## Why it exists

- **User-owned, not company-owned.** No SabiSafe administrator can add or remove
  a trusted recipient for you. Every mutation is keyed on `msg.sender`.
- **Public and auditable.** Anyone can call `listTrusted` and compare it with the
  approval transaction.
- **No custody.** The contract holds no funds and cannot move money. Every method
  is non-payable.
- **No owner, proxy, or admin key.** There is nothing to take over or upgrade.

## Methods

| Method | Kind | Args | Notes |
| --- | --- | --- | --- |
| `addTrusted(address account)` | write | `0x…` recipient | Signed by the owner. Reverts on duplicates, self, or zero address. |
| `removeTrusted(address account)` | write | `0x…` recipient | Signed by the owner. Reverts if not trusted. |
| `isTrusted(address owner, address account)` | view | both addresses | Used by SabiSafe before showing a badge |
| `listTrusted(address owner)` | view | owner address | Full list |
| `countTrusted(address owner)` | view | owner address | List size |
| `version()` | pure | — | `1.0.0` |

Events: `TrustedAdded(owner, account)` and `TrustedRemoved(owner, account)`.

Custom errors: `ZeroAddress`, `SelfTrust`, `AlreadyTrusted`, `NotTrusted`.

## Build and test

Requires [Foundry](https://book.getfoundry.sh/). `foundry.toml` pins
`solc 0.8.29`.

```bash
export PATH="$HOME/.foundry/bin:$PATH"
cd contract
forge build
forge test
```

The suite in `test/SabiSafeRegistry.t.sol` covers the version, add/read,
duplicate rejection, removal, unknown removal, self-trust, zero address,
per-owner isolation, and owner-only removal.

## Deploy to Aurora testnet

Deployed on 2026-11-14:

| | |
| --- | --- |
| Address | `0xdcbbde31e98a9a190c3932e562dc723bf56b87f8` |
| Tx | [`0x18102e58c32cb2650fba3878f8e5b4e0b03aff5b80b9ddb352031406706ff4c4`](https://explorer.aurora.dev/tx/0x18102e58c32cb2650fba3878f8e5b4e0b03aff5b80b9ddb352031406706ff4c4) |
| Deployer | `0x8eac9D1bb08bdDC7abf83a5DA761bD3E715fD223` |
| Explorer | <https://explorer.aurora.dev/address/0xdcbbde31e98a9a190c3932e562dc723bf56b87f8> |

Redeploying needs a wallet funded with Aurora testnet ETH. SabiSafe does not
create or fund wallets for you.

Aurora's public RPCs have two gaps that break a default `forge script` run:

- none implement `eth_getProof`, which Forge needs to build its fork, so
  `forge script` fails with `could not instantiate forked environment`;
- most do not implement `eth_feeHistory`, so EIP-1559 fee estimation fails.

`deploy.sh` handles both with `--skip-simulation` and `--legacy`, picks a
responding RPC, checks the signer balance, and prints the deployed address.

```bash
cd contract
export PATH="$HOME/.foundry/bin:$PATH"

# One-time: encrypted Foundry keystore. The prompt runs locally and the key is
# never written to this repository.
cast wallet import sabisafe --interactive

# Deploy (also accepts --ledger)
./deploy.sh --account sabisafe --write-env
```

`--write-env` sets `AURORA_REGISTRY_ADDRESS` in `server/.env`. Alternatively,
paste `src/SabiSafeRegistry.sol` into Remix and deploy with MetaMask. The target
is chain id `1313161555`, EVM version **Paris**, and it deploys with no
constructor arguments.

Equivalent raw command:

```bash
forge script script/Deploy.s.sol \
  --rpc-url https://testnet.aurora.dev \
  --account sabisafe \
  --broadcast --skip-simulation --legacy --with-gas-price 70000000
```

Never paste a private key or recovery phrase into this repository, a shell
history, or a chat message.

After deployment:

1. Put the real address in `AURORA_REGISTRY_ADDRESS` on the server. The client
   reads it from `/api/config`, so no client rebuild is needed.
2. Restart the server. `/api/config` will report `features.onchainRegistry: true`.
3. In SabiSafe, open **Contacts → Approve onchain** and sign `addTrusted` in your
   own wallet.
4. Verify the transaction hash on the Aurora explorer before showing the contact
   as approved.
5. Record the address and deployment transaction hash in the submission assets.

## Verify a deployment

```bash
cast call <registry-address> "version()(string)" --rpc-url https://testnet.aurora.dev
cast call <registry-address> "isTrusted(address,address)(bool)" <owner> <account> --rpc-url https://testnet.aurora.dev
```

## What this contract does not do

- It does not verify that a recipient is honest.
- It does not hold, escrow, or transfer ETH.
- It does not replace reading the address before a payment.
