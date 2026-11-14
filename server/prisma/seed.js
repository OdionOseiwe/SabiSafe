import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const lessons = [
  {
    slug: "what-is-money-in-your-phone",
    title: "Money that lives in your phone",
    description: "A gentle first look at crypto, blockchains, and why SabiSafe practises on testnet.",
    visual: "phone",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    order: 1,
    content: {
      intro:
        "Crypto is digital money that lives on a computer network. It is not inside one bank's building. Think of it like airtime you can send directly to another person.",
      sections: [
        {
          heading: "What is a blockchain?",
          body:
            "A blockchain is a public record book. Every payment is written down, and many computers keep a copy. Nobody can quietly erase a line. That is why people say crypto is 'transparent'.",
          bullets: [
            "The record is public, but your name is not written on it — only wallet addresses.",
            "Anyone can check that a payment happened.",
            "No single company controls the whole book.",
          ],
        },
        {
          heading: "Why do people use it?",
          body:
            "Families use crypto to send money across borders quickly. Some people use it because they do not need a bank branch. Others use it to hold savings outside a local currency.",
        },
        {
          heading: "The important difference",
          body:
            "A crypto payment cannot be undone. If you send money to the wrong address, nobody can reverse it. This is why we slow down, check the address, and practise first.",
        },
        {
          heading: "Why testnet first?",
          body:
            "Aurora has a practice network called testnet. The ETH there is free and has no real value. SabiSafe uses testnet so a mistake costs you nothing while you learn.",
        },
      ],
      takeaways: [
        "Crypto is digital money recorded on a public network.",
        "Payments cannot be reversed, so checking matters.",
        "SabiSafe uses Aurora testnet for practice.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "What is a blockchain?",
          options: [
            "A public record of transactions kept by many computers",
            "A private diary owned by one bank",
            "A type of mobile phone",
          ],
          answerIndex: 0,
          explanation: "A blockchain is a shared, public record. Many computers keep a copy of it.",
        },
        {
          question: "Can a crypto payment be undone after it is confirmed?",
          options: ["Yes, always", "No, normally it cannot", "Only on Sundays"],
          answerIndex: 1,
          explanation: "Confirmed crypto payments are not reversible. That is why we check carefully first.",
        },
        {
          question: "Why does SabiSafe use testnet?",
          options: [
            "Because it looks nicer",
            "Because testnet money is free, so mistakes cost nothing while learning",
            "Because mainnet is illegal",
          ],
          answerIndex: 1,
          explanation: "Testnet is a practice network. It uses free coins with no real value.",
        },
      ],
    },
  },
  {
    slug: "your-first-wallet",
    title: "Your first wallet",
    description: "What a wallet really is, what an address is, and what you should never share.",
    visual: "wallet",
    difficulty: "Beginner",
    estimatedMinutes: 6,
    order: 2,
    content: {
      intro:
        "A crypto wallet is like a small safe for your digital money. It holds the keys that let you approve payments. SabiSafe never holds those keys — your wallet app does.",
      sections: [
        {
          heading: "Your address is like an account number",
          body:
            "Your wallet address is a short name such as ada.testnet. It is safe to share so people can send you money. It is public information, like a bank account number.",
        },
        {
          heading: "Your recovery phrase is like the master key",
          body:
            "A recovery phrase is 12 or 24 words that can restore your wallet on another device. Anyone who has those words can take your money. Never share them, and never type them into a website that asks for them.",
        },
        {
          heading: "Why SabiSafe asks your wallet to approve",
          body:
            "SabiSafe prepares a payment and shows you a review. Then your own wallet opens and asks you to approve. SabiSafe cannot approve it for you, and the AI cannot approve it either. That separation is what keeps your money safer.",
          bullets: [
            "SabiSafe never sees your private key.",
            "Your wallet shows the final details before signing.",
            "You can always cancel in the wallet.",
          ],
        },
        {
          heading: "One wallet, one network",
          body:
            "This app uses Aurora testnet. If you use the same wallet on another network, the address may look similar but the money is separate. Always check the network label.",
        },
      ],
      takeaways: [
        "A wallet holds the keys; SabiSafe does not.",
        "Addresses are safe to share. Recovery phrases are not.",
        "You approve every payment inside your own wallet.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "Which one is safe to share so someone can send you money?",
          options: ["Your recovery phrase", "Your wallet address", "Your private key"],
          answerIndex: 1,
          explanation: "A wallet address is public, like an account number. The other two are secret.",
        },
        {
          question: "Who approves a payment in SabiSafe?",
          options: ["The AI assistant", "SabiSafe support", "You, inside your own wallet"],
          answerIndex: 2,
          explanation: "Only you can approve. SabiSafe and the AI never sign transactions.",
        },
        {
          question: "What does SabiSafe store about your keys?",
          options: ["Nothing — keys stay in your wallet", "Your private key, encrypted", "Your recovery phrase"],
          answerIndex: 0,
          explanation: "SabiSafe never collects private keys or recovery phrases. They stay in your wallet.",
        },
      ],
    },
  },
  {
    slug: "keeping-your-wallet-safe",
    title: "Keeping your wallet safe",
    description: "Simple habits that protect your money, your phone, and your family.",
    visual: "shield",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    order: 3,
    content: {
      intro:
        "Most wallet losses do not come from broken technology. They come from a shared phrase, a clicked link, or a rushed decision. A few habits prevent most of them.",
      sections: [
        {
          heading: "Keep secrets off your phone",
          body:
            "Write your recovery phrase on paper and keep it somewhere private. Do not photograph it, email it, or save it in a notes app. Photos sync to cloud accounts you may not control.",
        },
        {
          heading: "Use a screen lock and a strong password",
          body:
            "If your phone is lost, a screen lock buys you time. Use a password that is not your birthday or phone number, and do not reuse it on other websites.",
        },
        {
          heading: "Nobody legitimate needs your phrase",
          body:
            "Not SabiSafe, not Aurora support, not a giveaway, not a new 'security team'. If someone asks for your recovery phrase, treat it as a scam and end the conversation.",
        },
        {
          heading: "Send a small test first",
          body:
            "When sending to a new address, send a small amount first. Wait for confirmation, ask the person if they received it, then send the rest. This single habit prevents many painful mistakes.",
        },
      ],
      takeaways: [
        "Paper backup, kept private, beats a photo.",
        "No real support person asks for your phrase.",
        "Test with a small amount before a large one.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "Where is the safest place for your recovery phrase?",
          options: ["A photo in your gallery", "Written on paper and stored privately", "A message to yourself"],
          answerIndex: 1,
          explanation: "Paper kept privately is safer than anything that can sync or be screenshotted.",
        },
        {
          question: "Someone from 'support' asks for your recovery phrase. What do you do?",
          options: ["Send it quickly", "Ask them to verify first", "Refuse and end the conversation"],
          answerIndex: 2,
          explanation: "Real support never needs your recovery phrase. Refuse and stop talking to them.",
        },
        {
          question: "You are sending to a new address. What is the safest first step?",
          options: ["Send the full amount", "Send a small test amount first", "Ask the AI to approve it"],
          answerIndex: 1,
          explanation: "A small test payment confirms the address works before you send more.",
        },
      ],
    },
  },
  {
    slug: "what-is-aurora",
    title: "What is Aurora?",
    description: "Why this EVM network is fast and cheap, and what testnet means in practice.",
    visual: "network",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    order: 4,
    content: {
      intro:
        "Aurora is an EVM network built for Ethereum-style apps on the NEAR ecosystem. Payments usually finish in a few seconds, and the network fee is small. SabiSafe uses Aurora testnet because it is friendly to beginners and uses familiar 0x addresses.",
      sections: [
        {
          heading: "Fast and low cost",
          body:
            "Most Aurora transfers confirm in seconds. The fee is paid in ETH and is small, which matters when a family sends small amounts often.",
        },
        {
          heading: "EVM addresses start with 0x",
          body:
            "An Aurora address looks like 0x followed by 40 letters and numbers, such as 0x1234abcd... . It is the same shape as an Ethereum address. Copy the whole address and check the first and last six characters with the person.",
        },
        {
          heading: "Testnet versus mainnet",
          body:
            "Testnet is the practice network. Testnet ETH is free and has no value. Mainnet is the real network, where ETH has value and payments are permanent. SabiSafe always shows which one you are using.",
        },
        {
          heading: "The explorer is your proof",
          body:
            "Every payment has a transaction hash that starts with 0x. You can paste it into the Aurora explorer and see the same result SabiSafe shows. If a screenshot and the explorer disagree, trust the explorer.",
        },
      ],
      takeaways: [
        "Aurora is an EVM network with fast, low-cost payments.",
        "Aurora addresses start with 0x, like Ethereum addresses.",
        "Testnet is for practice; mainnet is real money.",
        "The explorer is the independent proof of a payment.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "What is testnet?",
          options: ["A practice network with free coins", "A faster mainnet", "A type of wallet"],
          answerIndex: 0,
          explanation: "Testnet is for practice. Its ETH has no real value.",
        },
        {
          question: "If a screenshot says a payment succeeded but the explorer says it failed, what do you trust?",
          options: ["The screenshot", "The explorer", "The person who sent the screenshot"],
          answerIndex: 1,
          explanation: "The explorer reads the chain directly, so it is the reliable source.",
        },
        {
          question: "What does an Aurora wallet address look like?",
          options: ["A name like ada.testnet", "0x followed by 40 characters", "A 12-word phrase"],
          answerIndex: 1,
          explanation: "Aurora is an EVM network, so addresses start with 0x and have 40 characters after it.",
        },
      ],
    },
  },
  {
    slug: "receiving-money",
    title: "Receiving money",
    description: "How to share your address, create a request, and confirm that money really arrived.",
    visual: "download",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    order: 5,
    content: {
      intro:
        "Receiving is simpler than sending. You share your address or a request link, and the other person sends from their own wallet. You never need to share a secret.",
      sections: [
        {
          heading: "Share your address or QR code",
          body:
            "Open the Receive page in SabiSafe. Your address and a QR code appear. You can copy the address, share the QR, or create a request with a name and an optional amount.",
          bullets: [
            "Read the first and last six characters aloud when confirming.",
            "Make sure the sender is on Aurora testnet.",
            "Never share your recovery phrase, even with a sender you trust.",
          ],
        },
        {
          heading: "Confirm the money on chain",
          body:
            "When the sender says they paid, do not rely on a screenshot. SabiSafe checks Aurora directly and shows the confirmed amount. If the balance has not changed, the payment may still be confirming, or it may have failed.",
        },
        {
          heading: "If nothing arrives",
          body:
            "Ask the sender for the transaction hash. Paste it into SabiSafe or an Aurora explorer. If the transaction does not exist, no money moved, regardless of what any message says.",
        },
        {
          heading: "A small buffer is normal",
          body:
            "Your spendable balance can be slightly lower than the displayed total, because the network fee is paid in ETH. That is normal and not a missing payment.",
        },
      ],
      takeaways: [
        "Sharing an address is safe; sharing a phrase is not.",
        "Check the chain, not a screenshot.",
        "A transaction hash settles any disagreement.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "What should you share so someone can pay you?",
          options: ["Your wallet address", "Your recovery phrase", "Your password"],
          answerIndex: 0,
          explanation: "Your address is public and safe to share. The other two are secret.",
        },
        {
          question: "Someone sends a screenshot saying they paid, but your balance is unchanged. What do you do?",
          options: ["Send the goods immediately", "Ask for the transaction hash and check the chain", "Send them your recovery phrase to fix it"],
          answerIndex: 1,
          explanation: "The chain is the truth. Ask for the hash and check it independently.",
        },
        {
          question: "Why is your spendable balance sometimes a little lower than the total?",
          options: ["The wallet keeps a little ETH for the gas fee", "The bank takes a cut", "SabiSafe charges a hidden fee"],
          answerIndex: 0,
          explanation: "Aurora charges a small gas fee, so a little ETH stays reserved.",
        },
      ],
    },
  },
  {
    slug: "sending-money-safely",
    title: "Sending money safely",
    description: "The three-step send flow, and how to use the warnings before you approve.",
    visual: "send",
    difficulty: "Beginner",
    estimatedMinutes: 6,
    order: 6,
    content: {
      intro:
        "Sending money takes three steps: enter the details, read the review, and approve in your own wallet. SabiSafe slows you down on purpose where mistakes are expensive.",
      sections: [
        {
          heading: "Step 1: Enter the details",
          body:
            "Choose a saved contact or paste an address. Type the amount in ETH. If you paste an address from a message, check it against a source you already trust.",
        },
        {
          heading: "Step 2: Read the review",
          body:
            "SabiSafe checks the address format, whether the account exists, whether the recipient is new, and whether the amount is unusually large. Warnings are reasons to pause, not obstacles to click past.",
          bullets: [
            "A new recipient is not automatically bad, but confirm the address another way.",
            "A missing account usually means the address has a typo.",
            "A large amount deserves a second pair of eyes.",
          ],
        },
        {
          heading: "Step 3: Approve and wait",
          body:
            "Your wallet opens with the final details. Approve only if everything matches. SabiSafe then checks the chain. A payment is not complete until the chain says confirmed.",
        },
        {
          heading: "Pressure is a warning sign",
          body:
            "If someone insists you send immediately, keeps the conversation secret, or says a fee unlocks a bigger payment, stop. Real emergencies still allow a short pause and a call to someone you trust.",
        },
      ],
      takeaways: [
        "Enter, review, then approve in your wallet.",
        "Warnings exist to protect you, not to slow you down for fun.",
        "Only the chain can confirm a payment.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "Where do you approve the final payment?",
          options: ["In SabiSafe's chat", "In your own wallet", "By email"],
          answerIndex: 1,
          explanation: "The wallet holds your keys, so approval always happens there.",
        },
        {
          question: "What does the review screen check?",
          options: [
            "Address format, account existence, new recipients, and large amounts",
            "Your email inbox",
            "Whether the person is friendly",
          ],
          answerIndex: 0,
          explanation: "SabiSafe runs practical checks and explains what it found.",
        },
        {
          question: "When is a payment truly complete?",
          options: ["When you press send", "When the wallet closes", "When the chain confirms it"],
          answerIndex: 2,
          explanation: "Until the chain confirms, the payment is still pending.",
        },
      ],
    },
  },
  {
    slug: "understanding-fees",
    title: "Understanding fees",
    description: "Why a tiny network fee exists, when it is charged, and how to read it.",
    visual: "fee",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    order: 7,
    content: {
      intro:
        "A fee is a small payment to the network for processing your transfer. On Aurora it is usually less than a cent. SabiSafe shows it separately so you always know what leaves your wallet.",
      sections: [
        {
          heading: "What the fee pays for",
          body:
            "Computers around the world check and record your transaction. The fee rewards them for that work. It is not paid to SabiSafe.",
        },
        {
          heading: "The amount and the fee are different",
          body:
            "If you send 0.002 ETH, the recipient receives 0.002 ETH. A tiny extra amount covers the network fee. Always keep a small ETH balance so a transfer does not fail for lack of gas.",
        },
        {
          heading: "Failed transactions",
          body:
            "A failed transaction can still use a small amount of gas, because the network did the work of checking it. That is normal. SabiSafe reads the real result and never reports a failure as a success.",
        },
        {
          heading: "Why cheap matters",
          body:
            "When fees are tiny, it makes sense to send a small test amount before a larger one. On networks with expensive fees, people skip the test and take bigger risks.",
        },
      ],
      takeaways: [
        "Fees pay the network, not SabiSafe.",
        "Keep a small balance for fees.",
        "A test transfer is affordable on Aurora — use it.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "Who receives the network fee?",
          options: ["SabiSafe", "The Aurora network validators", "The recipient"],
          answerIndex: 1,
          explanation: "The fee pays the network for processing, not SabiSafe or the recipient.",
        },
        {
          question: "You send 0.002 ETH. How much should the recipient receive?",
          options: ["0.002 ETH, minus nothing", "About 0.001 ETH", "0.002 ETH plus your savings"],
          answerIndex: 0,
          explanation: "The amount you enter goes to the recipient. The fee is an extra, tiny amount.",
        },
        {
          question: "Can a failed transaction still use a little gas?",
          options: ["No, never", "Yes, because the network still did work", "Only on mainnet"],
          answerIndex: 1,
          explanation: "The network still processes the attempt, so a small gas cost can apply.",
        },
      ],
    },
  },
  {
    slug: "spotting-scams",
    title: "Spotting scams",
    description: "The common tricks used against beginners, and the calm response to each one.",
    visual: "alert",
    difficulty: "Beginner",
    estimatedMinutes: 6,
    order: 8,
    content: {
      intro:
        "Scams usually follow a pattern. Once you know the pattern, it is easier to stay calm and refuse. No legitimate person needs your secret words or an urgent payment.",
      sections: [
        {
          heading: "Red flag: they ask for secret words",
          body:
            "Any request for a recovery phrase, private key, PIN, password, or one-time code is a scam. There is no exception for 'support', 'security checks', or 'wallet upgrades'.",
        },
        {
          heading: "Red flag: pay first to receive more",
          body:
            "A prize, inheritance, or large transfer that requires an upfront fee is almost always fake. Real money does not need your money to unlock it.",
        },
        {
          heading: "Red flag: urgency and secrecy",
          body:
            "Scammers rush you and ask you to keep it secret from family. Slow down. Call someone you trust. A genuine emergency survives a five-minute pause.",
        },
        {
          heading: "Red flag: links and fake apps",
          body:
            "A link in a message can open a fake wallet page that asks for your phrase. Open the official app yourself instead of tapping the link. Check the address bar carefully.",
        },
        {
          heading: "What to do",
          body:
            "Stop. Do not send money. Do not share secrets. Screenshot the message (hide your own details), talk to someone you trust, and report it. If you already shared a phrase, move your funds to a new wallet immediately.",
        },
      ],
      takeaways: [
        "Secrets requested = scam, every time.",
        "Upfront fees for prizes are a classic trick.",
        "Urgency is a tool. Pause anyway.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "Which request is always a scam?",
          options: ["A request for your recovery phrase", "A request to confirm an address", "A request to wait for confirmation"],
          answerIndex: 0,
          explanation: "No legitimate person needs your recovery phrase.",
        },
        {
          question: "Someone says you won a prize but must pay a fee first. What is this?",
          options: ["A normal tax", "A common scam pattern", "An Aurora feature"],
          answerIndex: 1,
          explanation: "Upfront fees to release a prize are a classic scam.",
        },
        {
          question: "Why do scammers create urgency?",
          options: ["To help you decide faster", "To stop you from checking with someone you trust", "To reduce network fees"],
          answerIndex: 1,
          explanation: "Urgency prevents careful thinking and second opinions.",
        },
      ],
    },
  },
  {
    slug: "your-recovery-phrase",
    title: "Your recovery phrase",
    description: "What those 12 or 24 words do, and how to store them without losing them.",
    visual: "key",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    order: 9,
    content: {
      intro:
        "Your recovery phrase is the master key to your wallet. It can restore your money on a new phone. It can also empty your wallet in the wrong hands.",
      sections: [
        {
          heading: "What it is",
          body:
            "A recovery phrase is a list of 12 or 24 ordinary words in a fixed order. The order matters. Anyone with the words can restore your wallet, even without your phone or password.",
        },
        {
          heading: "How to store it",
          body:
            "Write it on paper with a pen. Check the spelling and order twice. Keep it somewhere private and dry. Consider two copies in two safe places, for example at home and with a trusted relative.",
          bullets: [
            "Do not photograph it.",
            "Do not save it in email, chat, or notes.",
            "Do not read it aloud near a smart speaker or on a call.",
          ],
        },
        {
          heading: "If you lose it",
          body:
            "If you lose both the phrase and access to your wallet, the money cannot be recovered. No support team can reset it. This is why a careful paper backup matters.",
        },
        {
          heading: "If it leaks",
          body:
            "Act quickly. Create a new wallet with a new phrase and move your funds there. Do not reuse the old phrase. Ask a trusted family member to help you stay calm and do it in the right order.",
        },
      ],
      takeaways: [
        "The phrase is the master key — protect it like one.",
        "Paper, private, two safe places.",
        "If it leaks, move funds to a new wallet.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "What can someone do with your recovery phrase?",
          options: ["See your nickname", "Restore your wallet and take your money", "Change the weather"],
          answerIndex: 1,
          explanation: "The phrase restores the wallet, so it must stay secret.",
        },
        {
          question: "Which storage method is safest?",
          options: ["A photo in the cloud", "Written on paper, kept privately", "A public social media post"],
          answerIndex: 1,
          explanation: "Paper kept privately cannot be hacked or synced by accident.",
        },
        {
          question: "Your phrase leaked. What is the best next step?",
          options: ["Wait and see", "Create a new wallet and move your funds", "Share it with support for protection"],
          answerIndex: 1,
          explanation: "Create a fresh wallet with a new phrase and move funds immediately.",
        },
      ],
    },
  },
  {
    slug: "checking-a-transaction",
    title: "Checking a transaction",
    description: "Read a transaction hash, understand pending, confirmed, and failed, and verify it yourself.",
    visual: "check",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    order: 10,
    content: {
      intro:
        "A transaction is not finished because an app says 'sent'. It is finished when the blockchain confirms it. SabiSafe checks Aurora directly and shows the same result as the explorer.",
      sections: [
        {
          heading: "The transaction hash",
          body:
            "Every payment gets a unique code called a hash. It looks like a long mix of letters and numbers. The hash lets anyone look up that exact payment without seeing your private information.",
        },
        {
          heading: "The three states",
          body:
            "Pending means the network has not finished. Confirmed means the chain accepted it. Failed means the chain rejected it and the transfer did not happen. A failed payment can still use a little gas.",
          bullets: [
            "Pending: wait and check again.",
            "Confirmed: compare the amount and recipient.",
            "Failed: read the reason, then decide what to do.",
          ],
        },
        {
          heading: "Check it yourself",
          body:
            "Open History in SabiSafe and tap the explorer link. You will see the sender, receiver, amount, block height, and status. If the explorer and a screenshot disagree, trust the explorer.",
        },
        {
          heading: "Never trust a forwarded receipt",
          body:
            "Screenshots are easy to fake. Ask for the hash instead. A hash that does not exist on chain means there was no payment, no matter how official the image looks.",
        },
      ],
      takeaways: [
        "Confirmed on chain is the only real success.",
        "SabiSafe and the explorer should agree.",
        "Ask for a hash, not a screenshot.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "What does a transaction hash let you do?",
          options: ["Look up one exact payment on the chain", "Recover your wallet", "Change the fee"],
          answerIndex: 0,
          explanation: "The hash is a unique reference to one transaction.",
        },
        {
          question: "What does 'confirmed' mean?",
          options: ["The app sent a message", "The blockchain accepted the transaction", "The recipient replied"],
          answerIndex: 1,
          explanation: "Confirmed means the chain accepted and recorded it.",
        },
        {
          question: "A screenshot says paid, but the hash is not on chain. What is true?",
          options: ["The payment is confirmed", "No payment was recorded on chain", "The explorer is broken"],
          answerIndex: 1,
          explanation: "If the hash does not exist, the chain has no record of that payment.",
        },
      ],
    },
  },
  {
    slug: "stablecoins-explained",
    title: "Stablecoins, simply",
    description: "What a stablecoin is, why families use them, and the risks that remain.",
    visual: "coins",
    difficulty: "Beginner",
    estimatedMinutes: 6,
    order: 11,
    content: {
      intro:
        "A stablecoin is a digital token designed to stay close in value to a normal currency, usually the US dollar. People use them to hold or send money without the price jumping every day.",
      sections: [
        {
          heading: "Why people use them",
          body:
            "If you send ordinary crypto, the value can change between sending and receiving. A stablecoin aims to keep a steady value, which helps families budget remittances.",
        },
        {
          heading: "They are still digital assets",
          body:
            "Stable does not mean risk-free. The value depends on the issuer's reserves, the network you use, and the rules in your country. A stablecoin can lose its peg, and a network can have problems.",
          bullets: [
            "Check which network the token uses before sending.",
            "A token sent on the wrong network can be lost.",
            "Read who issues the token and how it is backed.",
          ],
        },
        {
          heading: "Testnet stablecoins are practice only",
          body:
            "SabiSafe uses testnet, so any tokens here have no real value. They are for learning the flow, not for savings or trading.",
        },
        {
          heading: "Not investment advice",
          body:
            "SabiSafe explains how things work. It does not tell you what to buy. For savings decisions, talk to a trusted person and check official sources.",
        },
      ],
      takeaways: [
        "Stablecoins aim for steady value, not guaranteed safety.",
        "Network and issuer both matter.",
        "Testnet tokens are for practice only.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "What is a stablecoin designed to do?",
          options: ["Stay close in value to a normal currency", "Always double in value", "Replace your wallet"],
          answerIndex: 0,
          explanation: "Stablecoins aim to track a currency such as the US dollar.",
        },
        {
          question: "Does 'stable' mean risk-free?",
          options: ["Yes", "No — issuer, network, and local rules still matter", "Only on weekends"],
          answerIndex: 1,
          explanation: "Stablecoins still carry issuer and network risks.",
        },
        {
          question: "What are testnet stablecoins for?",
          options: ["Real savings", "Practice only", "Paying taxes"],
          answerIndex: 1,
          explanation: "Testnet tokens have no real value and are only for practice.",
        },
      ],
    },
  },
  {
    slug: "helping-family-stay-safe",
    title: "Helping family stay safe",
    description: "A simple family plan for approvals, emergencies, and checking on each other.",
    visual: "family",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    order: 12,
    content: {
      intro:
        "Crypto safety works better with a second person. A short family plan prevents rushed decisions and makes it easier to ask for help without shame.",
      sections: [
        {
          heading: "Choose one trusted checker",
          body:
            "Pick a family member who will review large payments with you. Not to control your money — just to read the address and the amount before you approve. Save their contact in SabiSafe.",
        },
        {
          heading: "Agree a code word for real emergencies",
          body:
            "Scammers pretend to be relatives in trouble. Agree a family code word or a question only your family can answer. Use it on a phone call, not in a message.",
        },
        {
          heading: "Keep a small practice routine",
          body:
            "Once a month, practise a small testnet payment together, check a transaction hash, and review the safety tips. Familiarity makes panic less likely.",
        },
        {
          heading: "Respect privacy",
          body:
            "A helper should never ask for your recovery phrase or type it for you. They can sit beside you and guide you. Secrets stay with you.",
        },
        {
          heading: "Write down the plan",
          body:
            "Keep a simple note: who to call, which wallet you use, and what to do if something looks wrong. Store it with your important papers, not with your recovery phrase.",
        },
      ],
      takeaways: [
        "A trusted second pair of eyes prevents mistakes.",
        "Agree a code word that scammers cannot guess.",
        "Helpers guide; they never take your secrets.",
      ],
    },
    quiz: {
      questions: [
        {
          question: "What should a trusted family helper never do?",
          options: ["Read the address with you", "Ask for your recovery phrase", "Help you practise"],
          answerIndex: 1,
          explanation: "Even helpers must never see your recovery phrase.",
        },
        {
          question: "Why agree a family code word?",
          options: ["To unlock the wallet", "To check that a caller is really your relative", "To reduce fees"],
          answerIndex: 1,
          explanation: "A code word helps confirm identity when someone claims to be family.",
        },
        {
          question: "What is a healthy monthly routine?",
          options: [
            "Practise a small testnet payment and review safety tips",
            "Share your phrase to test it",
            "Send a large amount without checking",
          ],
          answerIndex: 0,
          explanation: "Regular, small practice builds confidence without risk.",
        },
      ],
    },
  },
];

async function main() {
  console.log(`Seeding ${lessons.length} lessons...`);
  // Remove lessons that were renamed during the Aurora migration (for example
  // the old "what-is-near" lesson) before upserting. The order column is
  // unique, so a stale row would otherwise block the renamed lesson.
  const removed = await prisma.learningLesson.deleteMany({
    where: { slug: { notIn: lessons.map((lesson) => lesson.slug) } },
  });
  if (removed.count) console.log(`Removed ${removed.count} stale lesson(s).`);

  for (const lesson of lessons) {
    await prisma.learningLesson.upsert({
      where: { slug: lesson.slug },
      create: lesson,
      update: {
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        quiz: lesson.quiz,
        visual: lesson.visual,
        difficulty: lesson.difficulty,
        estimatedMinutes: lesson.estimatedMinutes,
        order: lesson.order,
      },
    });
    console.log(`  ✓ ${lesson.order}. ${lesson.title}`);
  }
  console.log("Seed complete. No demo user, balance, or fake transaction was created.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
