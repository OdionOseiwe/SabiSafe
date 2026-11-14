import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Fingerprint,
  GraduationCap,
  HandHeart,
  KeyRound,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Logo, LogoMark } from "../components/brand/Logo";
import { Badge, buttonStyles } from "../components/ui";
import { VerificationPanel } from "../components/VerificationPanel";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    icon: Sparkles,
    title: "A private guide, not a know-it-all",
    body: "Ask anything in plain words. NEAR AI answers inside a sealed computer, and we check the digital proof before showing it as verified.",
  },
  {
    icon: GraduationCap,
    title: "Short lessons, no jargon",
    body: "Twelve gentle lessons with quizzes, voice support, and a Nigerian Pidgin option. Learn at your own pace, then practise.",
  },
  {
    icon: HandHeart,
    title: "Practise before real money",
    body: "Receive, send, and check a real Aurora testnet payment. Testnet ETH has no value, so a mistake costs nothing.",
  },
];

const JOURNEY = [
  {
    icon: Sparkles,
    step: "01",
    title: "Ask a question",
    body: "“What is a crypto wallet?” Get a short answer, plus the proof that it was processed privately.",
  },
  {
    icon: BookOpen,
    step: "02",
    title: "Learn the basics",
    body: "A five-minute lesson and a gentle quiz. Saved progress, no pressure.",
  },
  {
    icon: Wallet,
    step: "03",
    title: "Connect a testnet wallet",
    body: "Use your own Aurora wallet. We never see your keys or recovery phrase.",
  },
  {
    icon: QrCode,
    step: "04",
    title: "Receive, send, verify",
    body: "Share a request, approve a payment in your wallet, and watch the chain confirm it.",
  },
];

const LESSON_PREVIEW = [
  { title: "Money that lives in your phone", time: "5 min", icon: "01" },
  { title: "Your first wallet", time: "6 min", icon: "02" },
  { title: "Spotting scams", time: "6 min", icon: "03" },
];

const PROOF = {
  available: true,
  verified: true,
  provider: "NEAR AI Cloud",
  model: "z-ai/glm-5.3-flash",
  modelLabel: "GLM 5.3 Flash",
  privacyTier: "Confidential TEE",
  e2ee: true,
  signatureKind: "provider_tee",
  checkedAt: new Date().toISOString(),
  nonce: "9f3c…a71e",
  checks: [
    { key: "fresh_nonce", label: "Fresh challenge matched", passed: true, detail: "A new random challenge was created for this check." },
    { key: "gateway", label: "NEAR AI gateway proof", passed: true, detail: "The gateway runs inside an Intel TDX sealed environment." },
    { key: "model", label: "Private model TEE", passed: true, detail: "The answer was produced inside a confidential GPU." },
    { key: "e2ee", label: "End-to-end encryption", passed: true, detail: "Your question was encrypted to the model's attested key." },
  ],
  note: "Example of the verification panel. Proof shows where the answer ran, not that it is correct. Not financial advice.",
};

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-cream">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-[0.9rem] font-medium text-ink md:flex" aria-label="Main">
            <a href="#why" className="hover:text-leaf">
              Why SabiSafe
            </a>
            <a href="#journey" className="hover:text-leaf">
              How it works
            </a>
            <a href="#privacy" className="hover:text-leaf">
              Privacy
            </a>
            <a href="#learn" className="hover:text-leaf">
              Lessons
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to={user.onboarded ? "/dashboard" : "/onboarding"} className={buttonStyles({ size: "sm" })}>
                Open SabiSafe <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className={buttonStyles({ variant: "ghost", size: "sm" })}>
                  Sign in
                </Link>
                <Link to="/register" className={buttonStyles({ size: "sm" })}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="grain relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green" icon={ShieldCheck}>
                  Private AI, verified
                </Badge>
                <Badge tone="gold">Aurora testnet</Badge>
              </div>
              <h1 className="mt-5 max-w-xl text-[2.65rem] font-semibold leading-[1.05] text-ink sm:text-[3.2rem] md:text-[3.65rem]">
                Money made clear,
                <span className="block text-leaf">for you and the people you love.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted">
                SabiSafe is a patient crypto companion for older adults and complete beginners. Ask private questions,
                learn in short lessons, and practise real payments on Aurora testnet — with safety checks before every
                approval.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to={user ? "/dashboard" : "/register"} className={buttonStyles({ size: "lg" })}>
                  Start learning free <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#journey" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                  See how it works
                </a>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[0.85rem] font-medium text-muted">
                {[
                  "No recovery phrases, ever",
                  "The AI cannot sign payments",
                  "Every balance checked on chain",
                ].map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-leaf" aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="relative mx-auto w-full max-w-[460px]"
              aria-label="Preview of the SabiSafe assistant"
            >
              <div className="absolute -right-4 -top-5 hidden rotate-6 rounded-2xl border border-line bg-paper px-4 py-3 shadow-lift sm:block">
                <div className="flex items-center gap-2">
                  <LogoMark className="h-8 w-8" />
                  <div>
                    <p className="text-[0.72rem] font-bold uppercase tracking-wide text-muted">SabiGuide</p>
                    <p className="text-[0.9rem] font-semibold text-ink">Here with you</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-line bg-paper p-4 shadow-lift">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-leaf">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[0.9rem] font-semibold leading-tight text-ink">Ask Sabi</p>
                      <p className="text-[0.72rem] text-muted">Private and verified</p>
                    </div>
                  </div>
                  <Badge tone="green">Secure</Badge>
                </div>

                <div className="space-y-3 py-4">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-forest px-4 py-3 text-[0.9rem] leading-relaxed text-cream">
                    What is a crypto wallet, in simple words?
                  </div>
                  <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-line bg-cream px-4 py-3">
                    <p className="text-[0.9rem] leading-relaxed text-ink">
                      A wallet is like a small safe for your digital money. It holds the keys that let you approve
                      payments. Your address is safe to share — your recovery phrase is not.
                    </p>
                    <VerificationPanel verification={PROOF} compact />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line bg-cream px-3.5 py-2.5">
                  <p className="text-[0.82rem] text-muted">Ask in your own words…</p>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf text-white">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-7 -left-3 w-[250px] rotate-[-3deg] rounded-2xl border border-line bg-paper p-4 shadow-lift sm:-left-8">
                <div className="flex items-center justify-between">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Testnet wallet</p>
                  <span className="h-2 w-2 rounded-full bg-leaf" aria-hidden="true" />
                </div>
                <p className="mt-1 font-display text-2xl font-semibold text-ink">— ETH</p>
                <p className="mt-1 text-[0.76rem] leading-relaxed text-muted">
                  Your real balance appears after you connect. Checked directly on Aurora.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-line bg-paper">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 text-[0.8rem] font-medium text-muted md:px-8">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-leaf" /> NEAR AI Cloud private inference
            </span>
            <span className="inline-flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-leaf" /> TEE attestation checked
            </span>
            <span className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4 text-leaf" /> EVM wallets
            </span>
            <span className="inline-flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-leaf" /> We never ask for keys
            </span>
          </div>
        </section>

        {/* Why */}
        <section id="why" className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-clay">Why SabiSafe</p>
            <h2 className="mt-2 text-[2rem] font-semibold leading-tight text-ink md:text-[2.6rem]">
              Most crypto apps assume you already know. We don't.
            </h2>
            <p className="mt-3 text-[1rem] leading-relaxed text-muted">
              Big buttons, plain words, and a second check before anything irreversible. Built for a retired parent in
              Lagos as much as for their child abroad.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-card border border-line bg-paper p-6 shadow-soft"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-leaf">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[1.1rem] font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{feature.body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Journey */}
        <section id="journey" className="border-y border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-clay">The first 10 minutes</p>
                <h2 className="mt-2 text-[2rem] font-semibold leading-tight text-ink md:text-[2.6rem]">
                  One calm journey, from question to confirmed payment.
                </h2>
              </div>
              <Badge tone="gold">All practice is on testnet</Badge>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {JOURNEY.map((item, index) => (
                <article key={item.step} className="relative flex flex-col rounded-card border border-line bg-cream p-5">
                  <span className="font-display text-[0.9rem] font-semibold text-clay">{item.step}</span>
                  <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-paper text-leaf shadow-soft">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-[1rem] font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-[0.86rem] leading-relaxed text-muted">{item.body}</p>
                  {index < JOURNEY.length - 1 ? (
                    <ChevronRight className="absolute -right-4 top-1/2 hidden h-5 w-5 text-line lg:block" aria-hidden="true" />
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-clay">Privacy by default</p>
            <h2 className="mt-2 text-[2rem] font-semibold leading-tight text-ink md:text-[2.6rem]">
              Your question is private. The proof is public.
            </h2>
            <div className="mt-4 space-y-4 text-[0.98rem] leading-relaxed text-muted">
              <p>
                NEAR AI Cloud runs the model inside a Trusted Execution Environment — a sealed part of the computer that
                even the provider cannot look inside. Your question is encrypted end-to-end.
              </p>
              <p>
                SabiSafe checks the hardware attestation and the answer signature before showing a green
                <span className="font-semibold text-ink"> Verified private AI </span>
                panel. If any check fails, we say so plainly.
              </p>
              <p>
                Chats are <span className="font-semibold text-ink">not saved on our server by default</span>. If you
                choose to save one, we remove phone numbers, wallet addresses, and other personal details first.
              </p>
            </div>
            <ul className="mt-6 space-y-2.5">
              {[
                "Fresh challenge nonce matched for every attestation check",
                "Gateway and model TEE evidence both verified",
                "Response signature checked before the answer is shown",
                "Clear caveat: proof of privacy is not proof of correctness",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[0.9rem] text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-line bg-paper p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Live panel</p>
                <h3 className="text-[1.1rem] font-semibold text-ink">Verified private AI</h3>
              </div>
              <Badge tone="green" icon={ShieldCheck}>
                TEE
              </Badge>
            </div>
            <VerificationPanel verification={PROOF} />
            <p className="mt-3 text-center text-[0.74rem] leading-relaxed text-muted">
              The real panel shows the model, nonce, signature kind, and check results from your own request.
            </p>
          </div>
        </section>

        {/* Safety promises */}
        <section className="border-y border-line bg-forest text-cream">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gold">Our safety promises</p>
                <h2 className="mt-2 text-[2rem] font-semibold leading-tight md:text-[2.5rem]">
                  The AI can explain money. It can never move it.
                </h2>
                <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-cream/80">
                  SabiSafe prepares a payment and explains the risks. Then your own wallet asks you to approve. That
                  separation is deliberate, and we will never quietly remove it.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: KeyRound, title: "No secrets, ever", body: "We never ask for a recovery phrase, private key, OTP, or PIN — and we block messages that contain them." },
                  { icon: ShieldCheck, title: "No fake success", body: "A payment is only called confirmed when Aurora RPC says it is confirmed." },
                  { icon: Fingerprint, title: "No hidden AI", body: "If NEAR AI is not configured, answers are labelled SabiGuide, our built-in guide." },
                  { icon: Wallet, title: "No custody", body: "Your money stays in your wallet. SabiSafe never holds funds or signs for you." },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-cream/15 bg-cream/5 p-4">
                    <item.icon className="h-5 w-5 text-gold" aria-hidden="true" />
                    <h3 className="mt-2.5 text-[0.98rem] font-semibold">{item.title}</h3>
                    <p className="mt-1 text-[0.84rem] leading-relaxed text-cream/75">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lessons */}
        <section id="learn" className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-clay">The Learning Centre</p>
              <h2 className="mt-2 text-[2rem] font-semibold leading-tight text-ink md:text-[2.6rem]">
                Twelve short lessons. Zero shame.
              </h2>
              <p className="mt-3 text-[1rem] leading-relaxed text-muted">
                Each lesson takes five minutes, ends with a simple quiz, and can be read aloud. Start anywhere.
              </p>
            </div>
            <Link to="/register" className={buttonStyles({ variant: "secondary" })}>
              Browse the lessons <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {LESSON_PREVIEW.map((lesson) => (
              <article key={lesson.title} className="rounded-card border border-line bg-paper p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[0.85rem] font-semibold text-clay">{lesson.icon}</span>
                  <Badge>Beginner · {lesson.time}</Badge>
                </div>
                <h3 className="mt-3 text-[1.05rem] font-semibold text-ink">{lesson.title}</h3>
                <p className="mt-1.5 text-[0.85rem] text-muted">Plain words, a short quiz, and one practical next step.</p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-16 md:px-8 md:pb-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-line bg-paper">
            <div className="grain flex flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center md:px-10 md:py-12">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-clay">Start where you are</p>
                <h2 className="mt-2 max-w-lg text-[1.9rem] font-semibold leading-tight text-ink md:text-[2.3rem]">
                  Ask one question. Learn one thing. That is enough for today.
                </h2>
                <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-muted">
                  Free to use, private by default, and built on Aurora testnet. No recovery phrase required.
                </p>
              </div>
              <Link to={user ? "/dashboard" : "/register"} className={buttonStyles({ size: "lg" })}>
                {user ? "Continue" : "Create your free account"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-[0.82rem] leading-relaxed text-muted">
              A private, beginner-friendly crypto companion built for a privacy-first hackathon. Testnet only. Not
              financial advice.
            </p>
          </div>
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted">Product</p>
            <ul className="mt-2 space-y-1.5 text-[0.85rem] text-ink">
              <li><a href="#why" className="hover:text-leaf">Why SabiSafe</a></li>
              <li><a href="#privacy" className="hover:text-leaf">Private AI</a></li>
              <li><a href="#learn" className="hover:text-leaf">Learning Centre</a></li>
              <li><Link to="/login" className="hover:text-leaf">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted">Trust</p>
            <ul className="mt-2 space-y-1.5 text-[0.85rem]">
              <li>
                <a href="https://docs.near.ai/cloud/verification" target="_blank" rel="noreferrer" className="hover:text-leaf">
                  NEAR AI verification docs
                </a>
              </li>
              <li>
                <a href="https://explorer.aurora.dev" target="_blank" rel="noreferrer" className="hover:text-leaf">
                  Aurora testnet explorer
                </a>
              </li>
              <li>
                <a href="https://aurora.dev/faucet" target="_blank" rel="noreferrer" className="hover:text-leaf">
                  Testnet faucet
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line px-4 py-5 text-center text-[0.75rem] text-muted md:px-8">
          © {new Date().getFullYear()} SabiSafe. We will never ask for your recovery phrase, private key, OTP, or PIN.
        </div>
      </footer>
    </div>
  );
}
