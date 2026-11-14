import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ALargeSmall,
  Check,
  Lock,
  LogOut,
  MessagesSquare,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Alert, Badge, Button, Card, Field, Input, Select, Toggle } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { endpoints, errorMessage } from "../lib/api";
import { formatDate } from "../lib/format";

const TEXT_SIZES = [
  { value: "default", label: "Normal" },
  { value: "large", label: "Large" },
  { value: "larger", label: "Extra large" },
];

export default function Settings() {
  const { user, updateLocalUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    preferredLanguage: user?.preferredLanguage || "ENGLISH",
    experienceLevel: user?.experienceLevel || "COMPLETE_BEGINNER",
    assistanceMode: user?.assistanceMode || "TEXT",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [saveHistory, setSaveHistory] = useState(Boolean(user?.saveAiHistory));
  const [historySaving, setHistorySaving] = useState(false);

  const [textSize, setTextSize] = useState(() => {
    try {
      return localStorage.getItem("sabisafe:text-size") || "default";
    } catch {
      return "default";
    }
  });

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!saveHistory) {
      setConversations([]);
      return;
    }
    let alive = true;
    setHistoryLoading(true);
    endpoints
      .conversations()
      .then(({ data }) => {
        if (alive) setConversations(data.conversations);
      })
      .catch(() => {
        if (alive) setConversations([]);
      })
      .finally(() => {
        if (alive) setHistoryLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [saveHistory]);

  function applyTextSize(value) {
    setTextSize(value);
    document.documentElement.dataset.textSize = value;
    try {
      localStorage.setItem("sabisafe:text-size", value);
    } catch {
      // Setting the attribute still works for this session.
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileError("");
    setProfileSaved(false);
    setProfileSaving(true);
    try {
      const { data } = await endpoints.updateProfile(profile);
      updateLocalUser(data.user);
      setProfileSaved(true);
      toast("Preferences saved.", "success");
    } catch (err) {
      setProfileError(errorMessage(err, "Your preferences could not be saved."));
    } finally {
      setProfileSaving(false);
    }
  }

  async function toggleHistory(value) {
    setSaveHistory(value);
    setHistorySaving(true);
    try {
      const { data } = await endpoints.updateProfile({ saveAiHistory: value });
      updateLocalUser(data.user);
      toast(
        value
          ? "AI saving is on. Personal details will be removed before storage."
          : "AI saving is off. New conversations will not be stored.",
        "success",
      );
    } catch (err) {
      setSaveHistory(!value);
      toast(errorMessage(err, "That privacy setting could not be changed."), "error");
    } finally {
      setHistorySaving(false);
    }
  }

  async function deleteConversation(id) {
    try {
      await endpoints.deleteConversation(id);
      setConversations((current) => current.filter((item) => item.id !== id));
      toast("Saved conversation deleted.", "success");
    } catch (err) {
      toast(errorMessage(err, "That conversation could not be deleted."), "error");
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordError("The two new passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await endpoints.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      setPasswordSaved(true);
      toast("Password changed.", "success");
    } catch (err) {
      setPasswordError(errorMessage(err, "Your password could not be changed."));
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Settings and privacy"
        title="Make SabiSafe yours"
        description="Change how answers sound, how large the text is, and what we are allowed to save."
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[1.1rem] font-semibold text-ink">
              <UserRound className="h-5 w-5 text-leaf" /> Your preferences
            </h2>
            <form onSubmit={saveProfile} className="mt-3 space-y-3">
              {profileError ? <Alert tone="danger">{profileError}</Alert> : null}
              {profileSaved ? <Alert tone="success">Preferences saved.</Alert> : null}
              <Field label="First name" htmlFor="firstName">
                <Input
                  id="firstName"
                  maxLength={80}
                  value={profile.firstName}
                  onChange={(event) => setProfile((current) => ({ ...current, firstName: event.target.value }))}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Language" htmlFor="language">
                  <Select
                    id="language"
                    value={profile.preferredLanguage}
                    onChange={(event) => setProfile((current) => ({ ...current, preferredLanguage: event.target.value }))}
                  >
                    <option value="ENGLISH">Simple English</option>
                    <option value="PIDGIN">Nigerian Pidgin</option>
                  </Select>
                </Field>
                <Field label="How you like help" htmlFor="assistance">
                  <Select
                    id="assistance"
                    value={profile.assistanceMode}
                    onChange={(event) => setProfile((current) => ({ ...current, assistanceMode: event.target.value }))}
                  >
                    <option value="TEXT">Read and type</option>
                    <option value="VOICE">Voice helps me</option>
                  </Select>
                </Field>
              </div>
              <Field label="Experience level" htmlFor="experience">
                <Select
                  id="experience"
                  value={profile.experienceLevel}
                  onChange={(event) => setProfile((current) => ({ ...current, experienceLevel: event.target.value }))}
                >
                  <option value="COMPLETE_BEGINNER">Just starting</option>
                  <option value="LITTLE_EXPERIENCE">Know a little</option>
                  <option value="EXPERIENCED">Comfortable</option>
                </Select>
              </Field>
              <Button type="submit" loading={profileSaving} icon={Save}>
                Save preferences
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[1.1rem] font-semibold text-ink">
              <ALargeSmall className="h-5 w-5 text-leaf" /> Text size
            </h2>
            <p className="mt-1 text-[0.86rem] leading-relaxed text-muted">
              Larger text applies to every page and is saved on this device.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TEXT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => applyTextSize(size.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.82rem] font-semibold ${
                    textSize === size.value ? "border-leaf bg-mint text-forest" : "border-line bg-paper text-ink hover:border-leaf"
                  }`}
                  aria-pressed={textSize === size.value}
                >
                  {textSize === size.value ? <Check className="h-3.5 w-3.5" /> : null}
                  {size.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[1.1rem] font-semibold text-ink">
              <Lock className="h-5 w-5 text-leaf" /> Change password
            </h2>
            <p className="mt-1 text-[0.86rem] leading-relaxed text-muted">
              Use a password you do not use for your wallet or email. SabiSafe never stores it in plain text.
            </p>
            <form onSubmit={changePassword} className="mt-3 space-y-3">
              {passwordError ? <Alert tone="danger">{passwordError}</Alert> : null}
              {passwordSaved ? <Alert tone="success">Your password was changed.</Alert> : null}
              <Field label="Current password" htmlFor="current-password">
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={passwords.currentPassword}
                  onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="New password" htmlFor="new-password" hint="At least 8 characters, with a number.">
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={passwords.newPassword}
                    onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
                  />
                </Field>
                <Field label="Confirm new password" htmlFor="confirm-password">
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={passwords.confirm}
                    onChange={(event) => setPasswords((current) => ({ ...current, confirm: event.target.value }))}
                  />
                </Field>
              </div>
              <Button type="submit" loading={passwordSaving} icon={Lock}>
                Change password
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-[1.1rem] font-semibold text-ink">
                <MessagesSquare className="h-5 w-5 text-leaf" /> AI conversation saving
              </h2>
              <Badge tone={saveHistory ? "green" : "neutral"}>{saveHistory ? "On" : "Off"}</Badge>
            </div>
            <p className="mt-1 text-[0.86rem] leading-relaxed text-muted">
              Off by default. When on, we remove phone numbers, emails, wallet addresses, and possible secret phrases
              before storing anything. The AI answer itself is stored only with its verification summary.
            </p>
            <div className="mt-3">
              <Toggle
                checked={saveHistory}
                onChange={toggleHistory}
                disabled={historySaving}
                label="Save my AI conversations"
                description="You can delete any saved conversation below. Turning this off stops new saves immediately."
              />
            </div>

            {saveHistory ? (
              <div className="mt-3">
                <p className="text-[0.8rem] font-semibold text-ink">Saved conversations</p>
                {historyLoading ? (
                  <p className="mt-1 text-[0.8rem] text-muted">Loading…</p>
                ) : conversations.length ? (
                  <ul className="mt-1.5 space-y-1.5">
                    {conversations.map((conversation) => (
                      <li key={conversation.id} className="flex items-center gap-2 rounded-lg border border-line bg-cream px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.83rem] font-medium text-ink">{conversation.title}</p>
                          <p className="text-[0.7rem] text-muted">
                            {conversation.messageCount} messages · {formatDate(conversation.updatedAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteConversation(conversation.id)}
                          className="rounded-full p-1.5 text-clay hover:bg-clay-soft"
                          aria-label={`Delete ${conversation.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-[0.8rem] text-muted">No saved conversations yet.</p>
                )}
              </div>
            ) : null}
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[1.1rem] font-semibold text-ink">
              <ShieldCheck className="h-5 w-5 text-leaf" /> Account safety
            </h2>
            <dl className="mt-2 space-y-2 text-[0.84rem]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Email</dt>
                <dd className="truncate font-medium text-ink">{user?.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Member since</dt>
                <dd className="text-ink">{formatDate(user?.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Network</dt>
                <dd className="text-ink">Aurora testnet</dd>
              </div>
            </dl>
            <div className="mt-3 rounded-xl border border-line bg-cream p-3">
              <p className="text-[0.8rem] font-semibold text-ink">We never collect</p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
                Recovery phrases, private keys, keystore files, OTPs, PINs, or wallet passwords. If any page asks for
                them, close it.
              </p>
            </div>
            <Button
              variant="danger"
              className="mt-3 w-full"
              icon={LogOut}
              onClick={async () => {
                await logout();
                navigate("/");
              }}
            >
              Sign out
            </Button>
          </Card>

          <p className="px-1 text-[0.75rem] leading-relaxed text-muted">
            SabiSafe is a learning tool on Aurora testnet. It is not a bank, wallet provider, or financial adviser.
          </p>
        </div>
      </div>
    </div>
  );
}
