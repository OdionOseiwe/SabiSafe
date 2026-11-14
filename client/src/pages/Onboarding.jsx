import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Languages,
  Lock,
  MessageSquareText,
  Mic,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";
import { Logo } from "../components/brand/Logo";
import { Alert, Badge, Button, Card, Toggle } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { endpoints, errorMessage } from "../lib/api";
import { useToast } from "../context/ToastContext";

const LEVELS = [
  {
    value: "COMPLETE_BEGINNER",
    title: "I am just starting",
    body: "I have never used crypto. Explain everything, slowly.",
    icon: Sprout,
  },
  {
    value: "LITTLE_EXPERIENCE",
    title: "I know a little",
    body: "I have heard the words, but I am not confident yet.",
    icon: GraduationCap,
  },
  {
    value: "EXPERIENCED",
    title: "I am comfortable",
    body: "I have used wallets before and want the practice tools.",
    icon: Sparkles,
  },
];

const STEPS = ["Language and voice", "Your experience", "Privacy choice"];

export default function Onboarding() {
  const { user, updateLocalUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [form, setForm] = useState({
    preferredLanguage: user?.preferredLanguage || "ENGLISH",
    assistanceMode: user?.assistanceMode || "TEXT",
    experienceLevel: user?.experienceLevel || "COMPLETE_BEGINNER",
    saveAiHistory: Boolean(user?.saveAiHistory),
  });

  function update(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function finish({ skip = false } = {}) {
    setError("");
    setSaving(true);
    try {
      const payload = skip
        ? { completeOnboarding: true }
        : { ...form, completeOnboarding: true };
      const { data } = await endpoints.updateProfile(payload);
      updateLocalUser({ ...data.user, onboarded: true });
      toast(skip ? "You can set your preferences later in Settings." : "You are all set. Let's begin.", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "We could not save your preferences."));
    } finally {
      setSaving(false);
    }
  }

  const canContinue = step < 2 || acknowledged;

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-4 md:px-8">
          <Logo />
          <button
            type="button"
            onClick={() => finish({ skip: true })}
            className="text-[0.85rem] font-semibold text-muted hover:text-ink"
            disabled={saving}
          >
            Skip for now
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className="flex-1">
                <div className={`h-1.5 rounded-full ${index <= step ? "bg-leaf" : "bg-sand"}`} />
                <p className={`mt-1.5 text-[0.68rem] font-semibold uppercase tracking-wide ${index <= step ? "text-leaf" : "text-muted"}`}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-line bg-paper px-5 py-5 md:px-8">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-clay">
              Step {step + 1} of 3
            </p>
            <h1 className="mt-1.5 text-[1.7rem] font-semibold leading-tight text-ink md:text-[2rem]">
              {step === 0
                ? `Hello ${user?.firstName}. How should we speak with you?`
                : step === 1
                  ? "How much should we explain?"
                  : "One last privacy choice."}
            </h1>
            <p className="mt-1.5 text-[0.92rem] leading-relaxed text-muted">
              {step === 0
                ? "You can change all of this later in Settings. Nothing here is permanent."
                : step === 1
                  ? "This helps SabiGuide use the right words, not childish ones."
                  : "We choose privacy first. Saving is optional and always clean."}
            </p>
          </div>

          <div className="px-5 py-6 md:px-8">
            {error ? <Alert tone="danger" className="mb-5">{error}</Alert> : null}

            {step === 0 ? (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[0.92rem] font-semibold text-ink">
                    <Languages className="h-4 w-4 text-leaf" /> Which language feels easier?
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { value: "ENGLISH", title: "Simple English", sample: "A wallet is like a small safe for your money." },
                      { value: "PIDGIN", title: "Nigerian Pidgin", sample: "Wallet be like small safe for your money." },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => update({ preferredLanguage: option.value })}
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          form.preferredLanguage === option.value
                            ? "border-leaf bg-mint"
                            : "border-line bg-white hover:border-leaf/50"
                        }`}
                        aria-pressed={form.preferredLanguage === option.value}
                      >
                        <span className="flex items-center justify-between font-semibold text-ink">
                          {option.title}
                          {form.preferredLanguage === option.value ? <Check className="h-4 w-4 text-leaf" /> : null}
                        </span>
                        <span className="mt-1 block text-[0.83rem] leading-relaxed text-muted">{option.sample}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-2 text-[0.92rem] font-semibold text-ink">
                    <Mic className="h-4 w-4 text-leaf" /> How do you prefer to interact?
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { value: "TEXT", title: "Read and type", body: "Large text and clear buttons.", icon: MessageSquareText },
                      { value: "VOICE", title: "Voice helps me", body: "Speak questions; listen to answers.", icon: Mic },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => update({ assistanceMode: option.value })}
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          form.assistanceMode === option.value
                            ? "border-leaf bg-mint"
                            : "border-line bg-white hover:border-leaf/50"
                        }`}
                        aria-pressed={form.assistanceMode === option.value}
                      >
                        <span className="flex items-center gap-2 font-semibold text-ink">
                          <option.icon className="h-4 w-4 text-leaf" /> {option.title}
                        </span>
                        <span className="mt-1 block text-[0.83rem] leading-relaxed text-muted">{option.body}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}

            {step === 1 ? (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                {LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => update({ experienceLevel: level.value })}
                    className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${
                      form.experienceLevel === level.value
                        ? "border-leaf bg-mint"
                        : "border-line bg-white hover:border-leaf/50"
                    }`}
                    aria-pressed={form.experienceLevel === level.value}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      form.experienceLevel === level.value ? "bg-leaf text-white" : "bg-cream text-leaf"
                    }`}>
                      <level.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center justify-between font-semibold text-ink">
                        {level.title}
                        {form.experienceLevel === level.value ? <Check className="h-4 w-4 text-leaf" /> : null}
                      </span>
                      <span className="mt-1 block text-[0.86rem] leading-relaxed text-muted">{level.body}</span>
                    </span>
                  </button>
                ))}
              </motion.div>
            ) : null}

            {step === 2 ? (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <Toggle
                  checked={form.saveAiHistory}
                  onChange={(value) => update({ saveAiHistory: value })}
                  label="Save my AI conversations"
                  description="Off by default. When on, personal details are removed before anything is stored. You can delete saved chats at any time."
                />

                <div className="rounded-2xl border border-line bg-cream p-4">
                  <p className="flex items-center gap-2 text-[0.9rem] font-semibold text-ink">
                    <Lock className="h-4 w-4 text-leaf" /> What happens to your questions
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[0.85rem] leading-relaxed text-muted">
                    <li>• Your question is encrypted to a NEAR AI model running inside a sealed TEE.</li>
                    <li>• We check the gateway and model proof before showing the answer as verified.</li>
                    <li>• We never log your question, recovery phrase, private key, or wallet secrets.</li>
                    <li>• Chats are not stored on our server unless the switch above is on.</li>
                  </ul>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-4">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-line text-leaf focus:ring-leaf"
                  />
                  <span className="text-[0.88rem] leading-relaxed text-ink">
                    I understand SabiSafe uses <strong>Aurora testnet</strong>. Testnet ETH has no real value, and this
                    is a learning tool, not financial advice.
                  </span>
                </label>

                <div className="flex items-start gap-2.5 rounded-xl border border-gold/40 bg-gold-soft px-3.5 py-3 text-[0.82rem] leading-relaxed text-[#6f4708]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  We will never ask for your recovery phrase, private key, OTP, or PIN. SabiSafe cannot sign a payment
                  for you.
                </div>
              </motion.div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper px-5 py-4 md:px-8">
            <Button
              variant="ghost"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0 || saving}
              icon={ArrowLeft}
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
              {step < 2 ? (
                <Button onClick={() => setStep((value) => value + 1)} icon={ArrowRight}>
                  Continue
                </Button>
              ) : (
                <Button onClick={() => finish()} loading={saving} disabled={!canContinue} icon={Check}>
                  Finish setup
                </Button>
              )}
            </div>
          </div>
        </Card>

        <p className="mt-5 text-center text-[0.78rem] leading-relaxed text-muted">
          <Badge tone="gold">Testnet only</Badge>{" "}
          <span className="ml-1">No real money is used anywhere in SabiSafe today.</span>
        </p>
      </main>
    </div>
  );
}
