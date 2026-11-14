# SabiSafe API

Base URL: `/api`

Authentication uses an httpOnly, SameSite=Lax cookie named `sabisafe_session`, set by register/login. A Bearer token is also accepted for API clients. Every response includes `X-Request-Id`.

Errors use:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Some of the information needs checking.",
    "details": [{ "field": "email", "message": "Please enter a valid email address." }],
    "requestId": "…"
  }
}
```

## Public

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Status, database check, AI mode, registry mode |
| `GET` | `/config` | Public config: Aurora network, chain ID, explorer, faucet, registry, AI model, feature flags, limits |
| `GET` | `/ai/status` | Whether NEAR AI is configured, model, E2EE, fallback info |
| `GET` | `/receiving/public/:id` | Minimal public view of a shared payment request |

## Auth

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ firstName, email, password }` | Password ≥ 8 chars with a letter and a number |
| `POST` | `/auth/login` | `{ email, password }` | Sets session cookie |
| `POST` | `/auth/logout` | — | Clears cookie |
| `GET` | `/auth/me` | — | Current user or 401 |

Rate limited: 25 attempts per 15 minutes.

## Profile

| Method | Path | Body |
| --- | --- | --- |
| `PATCH` | `/users/me` | `{ firstName?, preferredLanguage?, experienceLevel?, assistanceMode?, saveAiHistory?, completeOnboarding? }` |
| `POST` | `/users/me/password` | `{ currentPassword, newPassword }` |

`preferredLanguage`: `ENGLISH` or `PIDGIN`. `experienceLevel`: `COMPLETE_BEGINNER`, `LITTLE_EXPERIENCE`, `EXPERIENCED`. `assistanceMode`: `TEXT` or `VOICE`.

## Dashboard

`GET /dashboard` returns learning progress, next lesson, wallet summary with live balance, recent transactions, contact count, practice count, AI mode, and the daily safety tip.

## Learning

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/lessons` | All lessons with per-user completion and quiz score |
| `GET` | `/lessons/:slug` | Full lesson content, quiz without answers, progress |
| `POST` | `/lessons/:slug/quiz` | `{ answers: number[] }` → score, per-question results, explanations, progress |

A score of 60% or more completes the lesson. The best score is kept.

## AI

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/ai/chat` | `{ message, conversationId?, save?, history? }` |
| `GET` | `/ai/attestation?fresh=1` | Gateway + model attestation verification |
| `GET` | `/ai/conversations` | Saved conversations (only when saving was on) |
| `GET` | `/ai/conversations/:id` | Messages with verification summaries |
| `DELETE` | `/ai/conversations/:id` | Delete a saved conversation |

`POST /ai/chat` response:

```json
{
  "mode": "near_ai",
  "degraded": false,
  "reply": { "role": "assistant", "content": "…", "createdAt": "…", "latencyMs": 1234 },
  "verification": {
    "available": true,
    "verified": true,
    "provider": "NEAR AI Cloud",
    "model": "z-ai/glm-5.3-flash",
    "privacyTier": "Confidential TEE",
    "signatureKind": "provider_tee",
    "checks": [{ "key": "response_signature", "label": "Answer signature verified", "passed": true, "detail": "…" }],
    "note": "…"
  },
  "privacy": { "saved": false, "ephemeral": true, "redacted": false, "note": "…" },
  "suggestions": ["…"],
  "lessonSlug": "your-first-wallet"
}
```

`mode` is `near_ai` or `guide`. `guide` means built-in guidance, never an AI model. If `verification.verified` is false, the UI must not show the green verified panel.

A message that looks like it contains a secret returns `security.blocked: true`, `mode: "guide"`, and `privacy.saved: false`. It is not sent to any model.

## Wallet

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/wallet` | Connected wallet with live chain balance, or `null` |
| `POST` | `/wallet/connect` | `{ accountId }`; validates an EVM `0x` address and reads it from Aurora testnet |
| `DELETE` | `/wallet` | Disconnect all wallets for the user |
| `GET` | `/wallet/activity` | Aurora explorer enrichment; `available: false` if unreachable |

## Transactions

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/transactions` | Up to 100 rows plus confirmed sent/received totals |
| `POST` | `/transactions/verify` | `{ txHash }`; reads Aurora RPC, requires the connected wallet to be involved, then stores |
| `POST` | `/transactions/:hash/refresh` | Re-reads chain status for an existing row |

A transaction is only stored after a real chain lookup. Status is `CONFIRMED`, `FAILED`, or `PENDING`. A client cannot declare success.

## Safety

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/safety/tips` | Curated safety tips and a reminder |
| `POST` | `/safety/preflight` | `{ recipient, amountEth }` → risk assessment + balance check |
| `POST` | `/safety/scan-message` | `{ message }` → scam-pattern flags and advice |

Preflight reasons can include `INVALID_ADDRESS` (including the zero address), `INVALID_AMOUNT`, `SELF_TRANSFER`, `CONTRACT_RECIPIENT`, `NO_ACTIVITY`, `NEW_RECIPIENT`, `LARGE_AMOUNT`, and `INSUFFICIENT_BALANCE`. On EVM chains a previously unused address is a caution, not proof that it is wrong. A `high_risk` level sets `blocking`, and the client must not offer approval.

## Contacts

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/contacts` | Contacts + whether the registry is configured |
| `POST` | `/contacts` | `{ name, relationship, walletAddress }` |
| `PATCH` | `/contacts/:id` | `{ name?, relationship? }` |
| `DELETE` | `/contacts/:id` | Remove a local contact |
| `POST` | `/contacts/:id/verify-registry` | Re-read registry status |
| `POST` | `/contacts/:id/confirm-onchain` | `{ txHash }`; verifies the approval transaction and registry entry |

`onchainStatus`: `REGISTERED`, `NOT_REGISTERED`, `UNKNOWN`, or `UNAVAILABLE` (contract not deployed).

## Receiving

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/receiving` | The user's requests with share URLs |
| `POST` | `/receiving` | `{ payerName, amountEth?, note? }` |
| `PATCH` | `/receiving/:id` | `{ status: "SHARED" \| "CANCELLED" }` |

Requires a connected wallet because the request embeds its `0x` address. Amounts are stored in wei.

## Practice

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/practice` | Six exercises with completion state |
| `POST` | `/practice/:key/complete` | Marks an exercise practised |

Practice completion is self-reported. It never creates a transaction or a balance.

## Rate limits

| Scope | Limit |
| --- | --- |
| General API | 400 requests / 15 min |
| Auth | 25 requests / 15 min |
| AI | 30 requests / 10 min (configurable) |
| Transactions / preflight | 40 requests / 10 min |

## Security notes for integrators

- Always treat Aurora RPC as the source of truth for money.
- Never trust a client-provided transaction status, amount, or hash without a chain lookup.
- Never log request bodies for AI endpoints.
- Never add a server-side signing key.
- Keep `AURORA_REGISTRY_ADDRESS` server-controlled; do not accept a contract address from the client.
- A transaction hash is `0x` + 64 hex characters. A wallet address is `0x` + 40 hex characters.
