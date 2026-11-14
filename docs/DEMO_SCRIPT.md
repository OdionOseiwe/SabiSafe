# Three-minute demo script

Use a real testnet wallet and a real transaction. Do not use fake balances or a
fabricated hash. If a live service is unavailable, say so — the fallback is part
of the design.

## Before recording

- [ ] `npm run dev` is running, or the Render deployment is live.
- [ ] Database is migrated and seeded (12 lessons).
- [ ] `NEAR_AI_API_KEY` is set if you want to show verified AI. If not, show the labelled SabiGuide fallback and say why.
- [x] `AURORA_REGISTRY_ADDRESS=0xdcbbde31e98a9a190c3932e562dc723bf56b87f8` (deployed Aurora testnet registry).
- [ ] An EVM wallet (MetaMask or similar) is switched to Aurora testnet and has a small funded ETH balance.
- [ ] One real Aurora testnet transaction hash is ready to paste.
- [ ] Browser zoom is 100%; text size is Normal or Large.
- [ ] No personal data, seed words, or API keys are visible on screen.

## 0:00 — Landing (20s)

“Most crypto apps assume you already know the words. SabiSafe is built for the
people who were never taught — older adults and complete beginners.”

Point out: private AI badge, testnet badge, “no recovery phrases, ever”.

## 0:20 — Create account and onboarding (25s)

Register with a demo email. On the onboarding screen, choose **Nigerian Pidgin**
and **voice helps me**, then the complete-beginner level. Leave AI saving **off**.

“Privacy is the default. Saving is an explicit choice.”

## 0:45 — Ask Sabi + verification (45s)

Open **Ask Sabi** and ask: “Wetin be crypto wallet?”

Show the answer and the **Verified private AI** panel. Expand **What we checked**.

“SabiSafe checked the NEAR AI gateway attestation, the model TEE attestation,
the TLS binding, and the signature on this exact answer. The panel also says what
this does *not* prove: it proves where the answer ran, not that it is correct.”

Then type a fake recovery phrase, e.g. “my phrase is apple banana cherry …”, and
show the local block. “This never reaches a model. It is stopped before inference.”

## 1:30 — Safety Centre (20s)

Open **Safety → Check a message**. Paste:

> “Congratulations! You won 5 ETH. Pay a small gas fee today or the prize expires in 30 minutes. Send your recovery phrase to claim.”

Show the flags: secrets, upfront fee, urgency. “This is a pattern check, not an AI
judgement, and it says so.”

## 1:50 — Wallet and receive (25s)

Connect a real EVM wallet on Aurora testnet. Show the real balance and block height. Open
**Receive**, show the QR code and address, and create a request. Open the public
share view.

“The address is public. The recovery phrase is never requested.”

If your audience may not have a wallet, open **Wallet** while disconnected first and show the
five-step setup guide: it links to the official MetaMask site, explains the recovery phrase,
adds Aurora testnet, and points to the faucet. Say: “You do not need to understand crypto
first. SabiSafe walks you through installing a wallet, but it never holds your keys.”

## 2:15 — Send with real chain verification (40s)

Open **Send**. Choose a saved contact or paste a second Aurora `0x` address. Enter a
small amount. Tap **Review payment safely**.

Show the warnings and the balance check. If a warning is high risk, show that
approval is blocked. Then approve in the wallet, wait, and show the result screen.

“SabiSafe did not sign this. The wallet did. The server then read Aurora RPC and
only called it confirmed when the chain confirmed it.”

Open the explorer link. “Same hash, same status, independent proof.”

## 2:55 — Close (10s)

“SabiSafe is private AI, real chain truth, and a safety design built for
beginners. No fake balances. No invented hashes. No key custody. Money made clear.”

## If something fails on camera

- **NEAR AI unavailable:** say so, show the SabiGuide label, and explain that the app refuses to call a fallback answer “verified”.
- **No funded wallet:** show the labelled empty state and explain that no fake balance is generated. The Aurora faucet link is shown in the app.
- **Transaction still pending:** leave it pending on screen and explain that SabiSafe never guesses. Open History and use **Check status**.
- **Registry unavailable:** if the Aurora RPC is down, show the contacts page notice and explain that onchain approval is temporarily unavailable. The registry is deployed at `0xdcbbde31e98a9a190c3932e562dc723bf56b87f8`, so never show a fake approval badge.
