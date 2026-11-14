# Submission checklist

Nothing here should be claimed as done until it is actually done. Do not make the
repository public, post on X, or submit the hackathon form without explicit
confirmation from the project owner.

## Code and build

- [ ] `npm install` completes on Node ≥ 24.22.1.
- [ ] `npm run db:generate` succeeds.
- [ ] `npm run build -w client` succeeds with no missing imports.
- [ ] `npm start -w server` boots and `/api/health` returns `status: ok`.
- [ ] Server unit tests pass (`npm test`).
- [ ] Playwright smoke tests pass against a running app.
- [ ] `forge test` passes in `contract/` (9 tests).
- [ ] No secrets, `.env` files, database dumps, or API keys are committed.

## Database

- [ ] Render PostgreSQL created.
- [ ] `DATABASE_URL` set with `sslmode=require`.
- [ ] `prisma migrate deploy` applied (a real migration folder exists).
- [ ] Seed ran; exactly 12 lessons are present.
- [ ] No demo user, fake balance, or fake transaction was inserted.

## NEAR AI

- [ ] `NEAR_AI_API_KEY` set in the server environment.
- [ ] `/api/ai/status` reports `configured: true`.
- [ ] A real chat returns `mode: "near_ai"`.
- [ ] `/api/ai/attestation?fresh=1` returns `verified: true` with a real nonce.
- [ ] Response signature verification succeeds (`signatureKind` is `provider_tee` or `gateway`).
- [ ] Screenshot or recording captured of the real verified panel.
- [ ] If verification ever fails, the UI shows it as unverified. Confirm this path.

## Aurora testnet wallet

- [ ] A real EVM account exists and is funded from the Aurora faucet.
- [ ] Wallet connect stores the real `0x` address.
- [ ] Balance matches the Aurora explorer.
- [ ] Receive page shows the correct address and QR.
- [ ] A receive request link opens publicly.
- [ ] A real send was approved in the user's wallet on Aurora testnet (chain ID 1313161555).
- [ ] The server verified the real hash through Aurora RPC.
- [ ] History shows the real status and a working explorer link.
- [ ] The real transaction hash is recorded for the submission.
- [ ] A cancelled wallet approval creates no transaction.

## Registry contract

- [x] Foundry installed (`forge 1.5.0`, `solc 0.8.29`).
- [x] `forge test` passes (9 tests).
- [x] Contract deployed to Aurora testnet from a hardware wallet, encrypted Foundry keystore, or Remix + MetaMask.
- [x] Real contract address recorded and set in `AURORA_REGISTRY_ADDRESS` (server only; the client reads it from `/api/config`). Address: `0xdcbbde31e98a9a190c3932e562dc723bf56b87f8`.
- [ ] `addTrusted` signed from the app and confirmed on chain.
- [ ] `isTrusted` / `listTrusted` return the expected result.
- [ ] Contact badge shows **Onchain approved** only after verification.
- [x] Deployment transaction hash recorded: `0x18102e58c32cb2650fba3878f8e5b4e0b03aff5b80b9ddb352031406706ff4c4`.
- [x] Contract README updated with the real address and explorer link.

## Privacy and security review

- [ ] AI history is off by default for a new account.
- [ ] Turning saving on stores redacted text only.
- [ ] A message containing a recovery phrase is blocked before inference.
- [ ] Server logs do not contain prompts, secrets, or tokens.
- [ ] JWT cookie is httpOnly, SameSite=Lax, and Secure in production.
- [ ] CORS allows only the production origin and local development.
- [ ] Rate limits are active on auth, AI, and transaction routes.
- [ ] No endpoint accepts a client-declared transaction status.
- [ ] No server-side signing key exists anywhere in the repo.
- [ ] The AI has no tool that can sign or transfer.

## Product review

- [ ] Landing page has no fake live balance.
- [ ] Dashboard empty states are honest.
- [ ] Every AI fallback is labelled SabiGuide.
- [ ] Every money figure is traceable to Aurora RPC.
- [ ] Text size Large and Extra large work.
- [ ] Keyboard navigation and focus rings work.
- [ ] Mobile bottom navigation and desktop sidebar work.
- [ ] Pidgin mode changes answer style.
- [ ] Voice input and read-aloud either work or fail gracefully.
- [ ] 404 page works.

## Deployment

- [ ] Render web service is live over HTTPS.
- [ ] `CLIENT_URL` matches the live origin exactly.
- [ ] `COOKIE_SECURE=true`.
- [ ] `JWT_SECRET` is strong and unique.
- [ ] SPA routes work on refresh (server serves `index.html`).
- [ ] Public receive-request links work in an incognito window.
- [ ] Health check is green.
- [ ] Cold-start behaviour checked; database reconnects cleanly.

## Submission assets

- [ ] Repository is public **only after explicit confirmation**.
- [ ] README has real screenshots, not mockups presented as live.
- [ ] Demo video is recorded and uploaded.
- [ ] Demo video does not expose secrets or personal data.
- [ ] Real contract address and transaction hash are included.
- [ ] Track selections: Privacy (primary), Real World, Security.
- [ ] Known limitations are stated honestly.
- [ ] X post drafted but **not published** until confirmed.
- [ ] Submission form reviewed with the project owner before sending.

## Final explicit confirmations required

- [ ] Confirm the exact submission payload.
- [ ] Confirm making the repository public.
- [ ] Confirm publishing the X post.
- [ ] Confirm submitting the hackathon form.
