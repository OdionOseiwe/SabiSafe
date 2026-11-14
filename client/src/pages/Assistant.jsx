import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  Lock,
  RefreshCw,
  Send,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { VerificationPanel } from "../components/VerificationPanel";
import { SpeakButton, VoiceInput } from "../components/VoiceControls";
import { Alert, Badge, Button, Card, Input, Spinner, Toggle } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useConfig } from "../context/ConfigContext";
import { useToast } from "../context/ToastContext";
import { endpoints, errorMessage } from "../lib/api";

const STARTERS = [
  "What is a crypto wallet?",
  "How do I receive money?",
  "How can I spot a scam?",
  "What is a recovery phrase?",
  "How do I check a transaction?",
];

function Message({ message, onUseSuggestion }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-forest text-cream" : "bg-mint text-leaf"
        }`}
        aria-hidden="true"
      >
        {isUser ? <UserRound className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </span>
      <div className={`min-w-0 max-w-[92%] sm:max-w-[85%] ${isUser ? "items-end" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "rounded-br-md bg-forest text-cream"
              : message.blocked
                ? "rounded-bl-md border border-clay/30 bg-clay-soft text-[#7a2f16]"
                : "rounded-bl-md border border-line bg-paper text-ink"
          }`}
        >
          <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">{message.content}</p>
          {message.mode ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={message.mode === "near_ai" ? "green" : "neutral"} icon={message.mode === "near_ai" ? ShieldCheck : BookOpen}>
                {message.mode === "near_ai" ? "NEAR AI" : "SabiGuide"}
              </Badge>
              {message.mode === "guide" ? (
                <span className="text-[0.72rem] text-muted">Built-in guidance, not an AI model.</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {!isUser && !message.blocked ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <SpeakButton text={message.content} />
            {message.privacy ? (
              <span className="inline-flex items-center gap-1 text-[0.72rem] text-muted">
                <Lock className="h-3 w-3" />
                {message.privacy.saved ? "Saved with details removed" : "Not saved on our server"}
              </span>
            ) : null}
          </div>
        ) : null}

        {!isUser && message.verification ? (
          <VerificationPanel verification={message.verification} compact defaultOpen={Boolean(message.verification.verified)} />
        ) : null}

        {!isUser && message.suggestions?.length ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {message.suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onUseSuggestion(suggestion)}
                className="rounded-full border border-line bg-cream px-3 py-1.5 text-[0.76rem] font-medium text-ink transition-colors hover:border-leaf hover:text-leaf"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        {!isUser && message.lessonSlug ? (
          <LessonLink slug={message.lessonSlug} />
        ) : null}
      </div>
    </div>
  );
}

function LessonLink({ slug }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/learn/${slug}`)}
      className="mt-2 inline-flex items-center gap-1 text-[0.78rem] font-semibold text-leaf hover:underline"
    >
      Open the related lesson <ChevronRight className="h-3.5 w-3.5" />
    </button>
  );
}

export default function Assistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { aiStatus, config } = useConfig();
  const { toast } = useToast();

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello ${user?.firstName || "friend"}. I am SabiGuide. Ask me anything about crypto, wallets, or staying safe — in your own words. I will keep it short.`,
      mode: aiStatus?.configured ? "near_ai" : "guide",
      suggestions: STARTERS.slice(0, 3),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [saveChat, setSaveChat] = useState(Boolean(user?.saveAiHistory));
  const [conversationId, setConversationId] = useState(null);
  const [attestation, setAttestation] = useState(null);
  const [attestationLoading, setAttestationLoading] = useState(true);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [conversations, setConversations] = useState([]);
  const bottomRef = useRef(null);
  const prefillUsed = useRef(false);

  const refreshAttestation = useCallback(async (fresh = false) => {
    setAttestationLoading(true);
    try {
      const { data } = await endpoints.attestation(fresh);
      setAttestation(data.attestation);
    } catch (error) {
      setAttestation({
        available: false,
        verified: false,
        message: errorMessage(error, "The verification check could not run right now."),
        checks: [],
      });
    } finally {
      setAttestationLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAttestation(false);
  }, [refreshAttestation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  useEffect(() => {
    if (prefillUsed.current) return;
    const prefill = location.state?.prefill;
    if (prefill) {
      prefillUsed.current = true;
      setInput(prefill);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  async function loadConversations() {
    setShowHistoryPanel(true);
    try {
      const { data } = await endpoints.conversations();
      setConversations(data.conversations);
    } catch (error) {
      toast(errorMessage(error, "Saved conversations could not be loaded."), "error");
    }
  }

  async function openConversation(id) {
    try {
      const { data } = await endpoints.conversation(id);
      setConversationId(id);
      setMessages(
        data.conversation.messages.map((message) => ({
          id: message.id,
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content: message.content,
          mode: message.aiMode === "NEAR_AI" ? "near_ai" : "guide",
          verification: message.verificationSummary
            ? {
                verified: message.verificationSummary.verified,
                provider: message.verificationSummary.provider,
                model: message.verificationSummary.model,
                signatureKind: message.verificationSummary.signatureKind,
                e2ee: message.verificationSummary.e2ee,
                checkedAt: message.verificationSummary.checkedAt,
                checks: [],
                note: "This summary was saved with the conversation. Run a fresh verification check for the current state.",
              }
            : null,
        })),
      );
      setShowHistoryPanel(false);
      toast("Conversation opened. Personal details were removed before it was saved.", "info");
    } catch (error) {
      toast(errorMessage(error, "That conversation could not be opened."), "error");
    }
  }

  async function deleteConversation(id) {
    try {
      await endpoints.deleteConversation(id);
      setConversations((current) => current.filter((item) => item.id !== id));
      if (conversationId === id) {
        setConversationId(null);
        setMessages(messages.slice(0, 1));
      }
      toast("Saved conversation deleted.", "success");
    } catch (error) {
      toast(errorMessage(error, "That conversation could not be deleted."), "error");
    }
  }

  async function send(text) {
    const question = String(text ?? input).trim();
    if (!question || sending) return;

    const userMessage = { id: `u-${Date.now()}`, role: "user", content: question };
    const history = messages
      .filter((message) => message.id !== "welcome" && !message.blocked)
      .slice(-6)
      .map((message) => ({ role: message.role, content: message.content }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);

    try {
      const { data } = await endpoints.chat({
        message: question,
        conversationId: conversationId || undefined,
        save: saveChat,
        history,
      });

      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply.content,
          mode: data.mode,
          verification: data.verification,
          privacy: data.privacy,
          suggestions: data.suggestions,
          lessonSlug: data.lessonSlug,
          blocked: Boolean(data.security?.blocked),
        },
      ]);

      if (data.privacy?.conversationId) setConversationId(data.privacy.conversationId);
      if (data.degraded) {
        toast("NEAR AI could not answer, so SabiGuide's built-in guidance is shown.", "warning");
      }
      if (data.security?.blocked) {
        toast("Message stopped locally: it looked like it contained a secret.", "warning");
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content:
            "I could not answer just now. Please check your connection and try again. If this keeps happening, the learning lessons still work.",
          mode: "guide",
          verification: {
            available: false,
            verified: false,
            message: errorMessage(error, "The request failed."),
            checks: [],
          },
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    send();
  }

  const configured = aiStatus?.configured;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Private by default"
        title="Ask Sabi"
        description="A patient guide for money questions. Answers from NEAR AI are checked for a hardware proof before we call them verified."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => refreshAttestation(true)} loading={attestationLoading} icon={RefreshCw}>
              Re-check proof
            </Button>
            <Button variant="ghost" size="sm" onClick={loadConversations}>
              Saved chats
            </Button>
          </>
        }
      />

      {!configured ? (
        <Alert tone="warning" title="NEAR AI is not connected on this server">
          You are using <strong>SabiGuide</strong>, the built-in guide. Its answers are written by hand, not generated by
          a model, and they are labelled that way. Add <code className="rounded bg-white/60 px-1">NEAR_AI_API_KEY</code>{" "}
          on the server to switch on private, verified AI answers.
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_0.5fr]">
        <Card className="flex min-h-[60vh] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-leaf">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.9rem] font-semibold leading-tight text-ink">SabiGuide</p>
                <p className="text-[0.72rem] text-muted">
                  {configured ? "NEAR AI Cloud · private TEE" : "Built-in guidance"}
                </p>
              </div>
            </div>
            <Badge tone={attestation?.verified ? "green" : "neutral"} icon={attestation?.verified ? ShieldCheck : ShieldAlert}>
              {attestation?.verified ? "Verified" : "Unverified"}
            </Badge>
          </div>

          {showHistoryPanel ? (
            <div className="border-b border-line bg-cream px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-[0.82rem] font-semibold text-ink">Saved conversations</p>
                <button type="button" onClick={() => setShowHistoryPanel(false)} className="text-[0.78rem] font-semibold text-leaf">
                  Close
                </button>
              </div>
              {conversations.length ? (
                <ul className="mt-2 max-h-56 space-y-1.5 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <li key={conversation.id} className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2">
                      <button
                        type="button"
                        onClick={() => openConversation(conversation.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate text-[0.84rem] font-medium text-ink">{conversation.title}</span>
                        <span className="block text-[0.7rem] text-muted">
                          {conversation.messageCount} messages · {new Date(conversation.updatedAt).toLocaleDateString("en-NG")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteConversation(conversation.id)}
                        className="rounded-full p-1.5 text-clay hover:bg-clay-soft"
                        aria-label={`Delete conversation ${conversation.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[0.8rem] text-muted">
                  No saved conversations. Chats are not saved unless you switch saving on.
                </p>
              )}
            </div>
          ) : null}

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 scrollbar-slim" aria-live="polite">
            {messages.map((message) => (
              <Message key={message.id} message={message} onUseSuggestion={(suggestion) => send(suggestion)} />
            ))}
            {sending ? (
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint text-leaf">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="rounded-2xl rounded-bl-md border border-line bg-paper px-4 py-3">
                  <Spinner label="Thinking privately…" />
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={onSubmit} className="border-t border-line bg-paper p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <Input
                aria-label="Your question"
                placeholder="Ask in your own words…"
                value={input}
                maxLength={1500}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                disabled={sending}
              />
              <VoiceInput onResult={(text) => setInput((current) => `${current} ${text}`.trim())} disabled={sending} />
              <Button type="submit" loading={sending} disabled={!input.trim()} icon={Send} className="shrink-0">
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.7rem] leading-relaxed text-muted">
                Never type a recovery phrase, private key, OTP, or PIN. We block those messages before they reach any
                model.
              </p>
              <button
                type="button"
                onClick={() => setSaveChat((value) => !value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${
                  saveChat ? "border-leaf/30 bg-mint text-forest" : "border-line bg-cream text-muted"
                }`}
                aria-pressed={saveChat}
              >
                <Lock className="h-3 w-3" />
                {saveChat ? "Saving (redacted)" : "Not saving"}
              </button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Verification</p>
              <button type="button" onClick={() => refreshAttestation(true)} className="text-muted hover:text-leaf" aria-label="Refresh verification">
                <RefreshCw className={`h-4 w-4 ${attestationLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            {attestationLoading ? (
              <p className="mt-2 text-[0.82rem] text-muted">Checking NEAR AI evidence…</p>
            ) : (
              <div className="mt-2">
                <VerificationPanel verification={attestation} />
              </div>
            )}
          </Card>

          <Card className="p-4">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">How this stays private</p>
            <ul className="mt-2 space-y-2 text-[0.82rem] leading-relaxed text-muted">
              <li>• Your question is encrypted end-to-end to the model.</li>
              <li>• The model runs inside a sealed TEE that even the provider cannot read.</li>
              <li>• A fresh challenge nonce is checked on every attestation.</li>
              <li>• Chats are not stored unless you turn saving on.</li>
              <li>• Saved chats have phone numbers and wallet addresses removed.</li>
            </ul>
            <p className="mt-3 rounded-lg bg-cream px-2.5 py-2 text-[0.74rem] leading-relaxed text-muted">
              Verification proves where an answer ran. It does not prove the answer is correct, and it is not financial
              advice.
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Try asking</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => send(starter)}
                  className="rounded-full border border-line bg-cream px-2.5 py-1.5 text-[0.75rem] font-medium text-ink hover:border-leaf hover:text-leaf"
                >
                  {starter}
                </button>
              ))}
            </div>
          </Card>

          <Toggle
            checked={saveChat}
            onChange={setSaveChat}
            label="Save this conversation"
            description={`Off by default. Personal details are removed before saving.${
              user?.saveAiHistory ? " You previously enabled saving in Settings." : ""
            }`}
          />
          <p className="px-1 text-[0.72rem] leading-relaxed text-muted">
            Model: {config?.ai?.model || aiStatus?.model || "z-ai/glm-5.3-flash"} · Provider:{" "}
            {aiStatus?.provider || "NEAR AI Cloud"}
          </p>
        </div>
      </div>
    </div>
  );
}
