// Curated fallback answers used when NEAR AI Cloud is not configured.
// Every response produced here is clearly labelled as "SabiGuide", never as NEAR AI.

const ENGLISH = {
  greeting: {
    answer:
      "Hello! I am SabiGuide. I can explain crypto in simple words, help you practise on Aurora testnet, and show you how to stay safe.\n\nYou can ask me things like:\n• What is a crypto wallet?\n• How do I receive money?\n• Is this message a scam?",
    suggestions: ["What is a crypto wallet?", "How do I receive money?", "How can I spot a scam?"],
    lessonSlug: "what-is-money-in-your-phone",
  },
  what_is_crypto: {
    answer:
      "Crypto is digital money that lives on a computer network instead of inside one bank. Think of it like airtime that you can send to another person directly.\n\nOn Aurora, the money is called ETH. Every payment is recorded on a public list called the blockchain, so you can check it later.\n\nImportant: crypto payments cannot be undone. That is why we practise on testnet first.",
    suggestions: ["What is a wallet?", "What is Aurora?", "How do I stay safe?"],
    lessonSlug: "what-is-money-in-your-phone",
  },
  what_is_wallet: {
    answer:
      "A crypto wallet is like a small safe for your digital money. It holds the keys that let you approve payments.\n\nTwo things to remember:\n• Your wallet address is like your account number. It is safe to share so people can send you money.\n• Your recovery phrase is like the master key to the safe. Never share it with anyone, not even someone claiming to be support.",
    suggestions: ["How do I receive money?", "What is a recovery phrase?", "How do I spot a scam?"],
    lessonSlug: "your-first-wallet",
  },
  what_is_aurora: {
    answer:
      "Aurora is a fast, low-cost EVM network built on NEAR. Payments usually finish in a few seconds and cost a tiny fraction of a coin.\n\nSabiSafe uses Aurora testnet. Testnet is a practice network: the money there has no real value, so it is the safest place to learn.\n\nWhen you are ready, the same skills work on mainnet with real money.",
    suggestions: ["What is testnet?", "How do I receive money?", "What are fees?"],
    lessonSlug: "what-is-aurora",
  },
  receive: {
    answer:
      "To receive money, the other person needs your wallet address.\n\n1. Open your Wallet page in SabiSafe.\n2. Copy your address or let them scan your QR code.\n3. Ask them to double-check the first and last few characters before they send.\n\nWhen the payment arrives, SabiSafe checks the chain and shows the real status. We never guess.",
    suggestions: ["How do I send money?", "What is an address?", "What are fees?"],
    lessonSlug: "receiving-money",
  },
  send: {
    answer:
      "Sending money has three steps:\n\n1. Enter the person's wallet address and the amount.\n2. Read the review screen carefully. SabiSafe will warn you about new contacts, large amounts, or addresses that do not exist.\n3. Approve the payment in your own wallet. SabiSafe cannot approve it for you.\n\nAfter approval, wait for the chain to confirm. Only then is the payment really sent.",
    suggestions: ["How do I check a transaction?", "How can I spot a scam?", "What are fees?"],
    lessonSlug: "sending-money-safely",
  },
  fees: {
    answer:
      "A fee is a small payment to the network for processing your transfer. On Aurora, fees are usually less than a cent.\n\nSabiSafe always shows the amount you are sending separately from the network fee, so you know exactly what leaves your wallet.",
    suggestions: ["What is Aurora?", "How do I send money?", "What is testnet?"],
    lessonSlug: "understanding-fees",
  },
  scam: {
    answer:
      "Be careful when someone:\n• asks for your recovery phrase, private key, PIN, or a code sent to your phone;\n• says you must pay a fee before receiving a prize or a large transfer;\n• pressures you to act fast or keeps you secret from your family;\n• sends a link and asks you to type your wallet details.\n\nStop, take a breath, and check with someone you trust. SabiSafe will never ask for those secrets, and no real support person will either.",
    suggestions: ["What is a recovery phrase?", "Who can see my balance?", "How do I report a scam?"],
    lessonSlug: "spotting-scams",
  },
  recovery: {
    answer:
      "A recovery phrase (sometimes called a seed phrase) is 12 or 24 words that can restore your wallet. Anyone who has those words can take your money.\n\nNever type them into a website, chat, or app unless you are restoring your own wallet in a wallet you trust. SabiSafe will never ask for them.\n\nIf you think someone saw your phrase, move your funds to a new wallet with a new phrase as soon as possible, and ask a trusted family member to help.",
    suggestions: ["How do I back up my wallet?", "How can I spot a scam?", "What is a wallet?"],
    lessonSlug: "your-recovery-phrase",
  },
  backup: {
    answer:
      "Write your recovery phrase on paper, in the correct order, and keep it somewhere private and safe. Do not save it in a photo, email, or notes app.\n\nA good habit is to make two copies and keep them in different safe places. Never show them to a camera or to someone who offers to \"help\".",
    suggestions: ["What is a recovery phrase?", "How can I spot a scam?", "What is a wallet?"],
    lessonSlug: "keeping-your-wallet-safe",
  },
  transaction_status: {
    answer:
      "A transaction is not finished until the blockchain confirms it. SabiSafe checks Aurora directly and shows one of three states:\n\n• Pending — the network has not confirmed it yet.\n• Confirmed — the chain accepted it.\n• Failed — the chain rejected it; no money moved.\n\nYou can open the explorer link on the transaction to see the same result independently.",
    suggestions: ["How do I send money?", "What are fees?", "What is testnet?"],
    lessonSlug: "checking-a-transaction",
  },
  testnet: {
    answer:
      "Testnet is a practice copy of the Aurora network. The coins there are free and have no real value, so mistakes do not cost real money.\n\nSabiSafe always labels testnet clearly. When you move to mainnet, the money is real and payments cannot be undone, so take extra care.",
    suggestions: ["How do I get testnet ETH?", "What is Aurora?", "How do I send money?"],
    lessonSlug: "what-is-aurora",
  },
  privacy: {
    answer:
      "SabiSafe is private by default. Your AI questions are not saved on our server unless you switch on \"Save this conversation\".\n\nWhen you do save, we remove personal details like phone numbers and wallet addresses first. The AI answer is processed inside a sealed environment called a TEE, and we show you the proof that it came from NEAR AI Cloud.",
    suggestions: ["What is a TEE?", "Who can see my balance?", "How do I stay safe?"],
    lessonSlug: "keeping-your-wallet-safe",
  },
  tee: {
    answer:
      "A TEE (Trusted Execution Environment) is a sealed part of a computer. Even the company running the computer cannot look inside while your question is being processed.\n\nNEAR AI Cloud uses TEEs and gives a digital proof, called an attestation. SabiSafe checks that proof before it shows you an AI answer as verified. A green panel means the proof checked out; it does not mean the answer is financially correct.",
    suggestions: ["What does verified mean?", "Who can see my balance?", "What is NEAR AI?"],
    lessonSlug: "keeping-your-wallet-safe",
  },
  not_financial_advice: {
    answer:
      "I can explain how things work and help you practise, but I cannot tell you what to invest in or promise that something is safe.\n\nFor money decisions, talk to someone you trust and never send more than you can afford to lose while learning.",
    suggestions: ["How can I spot a scam?", "What is a wallet?", "How do I receive money?"],
    lessonSlug: "spotting-scams",
  },
  default: {
    answer:
      "I want to make sure I understand you. I can help with:\n\n• what crypto and wallets are;\n• receiving and sending on Aurora testnet;\n• checking whether a transaction was confirmed;\n• spotting scams and keeping your recovery phrase safe.\n\nTry asking in your own words, or open the Learning Centre for a short lesson.",
    suggestions: ["What is a crypto wallet?", "How do I receive money?", "How can I spot a scam?"],
    lessonSlug: "what-is-money-in-your-phone",
  },
};

const PIDGIN = {
  greeting: {
    answer:
      "Hello! My name na SabiGuide. I go explain crypto for simple words, help you practise on Aurora testnet, and teach you how to stay safe.\n\nYou fit ask me:\n• Wetin be crypto wallet?\n• How I go receive money?\n• This message na scam?",
    suggestions: ["Wetin be crypto wallet?", "How I go receive money?", "How I go know scam?"],
    lessonSlug: "what-is-money-in-your-phone",
  },
  what_is_crypto: {
    answer:
      "Crypto na digital money wey dey live on computer network, no be inside one bank. E be like airtime wey you fit send give another person direct.\n\nFor Aurora, the money name na ETH. Every payment dey recorded on public list wey dem call blockchain, so you fit check am later.\n\nBut crypto payment no dey reverse. Na why we practise on testnet first.",
    suggestions: ["Wetin be wallet?", "Wetin be Aurora?", "How I go stay safe?"],
    lessonSlug: "what-is-money-in-your-phone",
  },
  what_is_wallet: {
    answer:
      "Crypto wallet be like small safe for your digital money. E hold the keys wey you use approve payment.\n\nTwo things to remember:\n• Your wallet address be like account number. E safe to share so person fit send you money.\n• Your recovery phrase be like master key. No ever share am with anybody, even if person claim say na support.",
    suggestions: ["How I go receive money?", "Wetin be recovery phrase?", "How I go know scam?"],
    lessonSlug: "your-first-wallet",
  },
  what_is_aurora: {
    answer:
      "Aurora na fast blockchain wey cheap well well. Payment dey finish for few seconds and fee small.\n\nSabiSafe dey use Aurora testnet. Testnet na practice network: the money there no get real value, so e safe to learn.\n\nWhen you ready, the same skill go work on mainnet with real money.",
    suggestions: ["Wetin be testnet?", "How I go receive money?", "How much be fee?"],
    lessonSlug: "what-is-aurora",
  },
  receive: {
    answer:
      "To receive money, the other person need your wallet address.\n\n1. Open Wallet page for SabiSafe.\n2. Copy your address or make them scan your QR code.\n3. Tell them check first and last characters before they send.\n\nWhen money land, SabiSafe go check the chain and show you real status. We no dey guess.",
    suggestions: ["How I go send money?", "Wetin be address?", "How much be fee?"],
    lessonSlug: "receiving-money",
  },
  send: {
    answer:
      "To send money, na three steps:\n\n1. Put the person wallet address and the amount.\n2. Read the review screen well. SabiSafe go warn you about new person, big amount, or address wey no exist.\n3. Approve the payment inside your own wallet. SabiSafe no fit approve for you.\n\nAfter you approve, wait for chain confirmation. Na then money really send.",
    suggestions: ["How I go check transaction?", "How I go know scam?", "How much be fee?"],
    lessonSlug: "sending-money-safely",
  },
  scam: {
    answer:
      "Watch out when person:\n• ask for your recovery phrase, private key, PIN, or code wey dem send your phone;\n• talk say you must pay fee before you collect prize or big transfer;\n• dey rush you or say make you hide am from your family;\n• send link wey ask you type wallet details.\n\nStop, breathe, and check with person you trust. SabiSafe no go ever ask for those secrets.",
    suggestions: ["Wetin be recovery phrase?", "Who fit see my balance?", "How I go report scam?"],
    lessonSlug: "spotting-scams",
  },
  recovery: {
    answer:
      "Recovery phrase (some people call am seed phrase) na 12 or 24 words wey fit restore your wallet. Anybody wey get those words fit take your money.\n\nNo ever type am inside website, chat, or app unless na your own wallet you dey restore. SabiSafe no go ever ask for am.\n\nIf you think say person see your phrase, move your money to new wallet sharp sharp, and ask family member you trust to help.",
    suggestions: ["How I go back up wallet?", "How I go know scam?", "Wetin be wallet?"],
    lessonSlug: "your-recovery-phrase",
  },
  fees: {
    answer:
      "Fee na small money you dey pay network to process your transfer. On Aurora, fee dey less than one cent.\n\nSabiSafe dey always show the amount you dey send separate from network fee, so you know exactly wetin leave your wallet.",
    suggestions: ["Wetin be Aurora?", "How I go send money?", "Wetin be testnet?"],
    lessonSlug: "understanding-fees",
  },
  default: {
    answer:
      "I want make sure I understand you. I fit help with:\n\n• wetin crypto and wallet mean;\n• how to receive and send on Aurora testnet;\n• how to check if transaction confirm;\n• how to spot scam and keep your recovery phrase safe.\n\nTry ask in your own words, or open Learning Centre for short lesson.",
    suggestions: ["Wetin be crypto wallet?", "How I go receive money?", "How I go know scam?"],
    lessonSlug: "what-is-money-in-your-phone",
  },
};

const INTENTS = [
  { key: "greeting", words: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "how far"] },
  { key: "recovery", words: ["recovery phrase", "seed phrase", "secret phrase", "secret words", "12 words", "24 words", "backup phrase"] },
  { key: "backup", words: ["back up", "backup", "save my phrase", "write down"] },
  { key: "scam", words: ["scam", "fraud", "fake", "stolen", "hacked", "suspicious", "419", "blackmail"] },
  { key: "fees", words: ["fee", "fees", "gas", "cost", "charge", "how much to send"] },
  { key: "receive", words: ["receive", "get money", "collect", "my address", "qr", "deposit", "incoming"] },
  { key: "send", words: ["send", "transfer", "pay someone", "withdraw", "cash out"] },
  { key: "transaction_status", words: ["transaction", "tx", "confirmed", "pending", "failed", "hash", "explorer", "receipt"] },
  { key: "what_is_wallet", words: ["wallet", "address", "account number"] },
  { key: "what_is_aurora", words: ["aurora", "what is aurora", "aurora network", "aurora eth"] },
  { key: "what_is_crypto", words: ["crypto", "cryptocurrency", "bitcoin", "blockchain", "digital money", "what is money"] },
  { key: "testnet", words: ["testnet", "mainnet", "practice network", "fake money", "free eth"] },
  { key: "tee", words: ["tee", "attestation", "sealed", "trusted execution", "verified ai"] },
  { key: "privacy", words: ["privacy", "private", "save my chat", "who can see", "store my"] },
  { key: "not_financial_advice", words: ["invest", "should i buy", "profit", "guarantee", "make me money", "which coin"] },
];

function chooseIntent(message) {
  const text = String(message || "").toLowerCase();
  let best = null;
  for (const intent of INTENTS) {
    for (const word of intent.words) {
      if (text.includes(word)) {
        const score = word.length;
        if (!best || score > best.score) best = { key: intent.key, score };
      }
    }
  }
  return best?.key || "default";
}

/**
 * Produce a curated, clearly-labelled fallback answer.
 * This is NOT an AI answer and must never be presented as one.
 */
export function guideAnswer({ message, language = "ENGLISH" }) {
  const intent = chooseIntent(message);
  const pack = language === "PIDGIN" ? PIDGIN : ENGLISH;
  const entry = pack[intent] || pack.default;
  return {
    intent,
    content: entry.answer,
    suggestions: entry.suggestions,
    lessonSlug: entry.lessonSlug,
  };
}

export const GUIDE_SUGGESTIONS = ENGLISH.default.suggestions;
