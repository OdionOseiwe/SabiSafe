import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Alert, Button, Field, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ firstName: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.onboarded ? "/dashboard" : "/onboarding", { replace: true });
    }
  }, [user, navigate]);

  const passwordOk = form.password.length >= 8 && /[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password);
  const confirmOk = form.confirm.length > 0 && form.confirm === form.password;

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!passwordOk) {
      setError("Use at least 8 characters, including one letter and one number.");
      return;
    }
    if (!confirmOk) {
      setError("The two passwords do not match. Please check them.");
      return;
    }
    setLoading(true);
    try {
      const next = await register({
        firstName: form.firstName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast(`Welcome, ${next.firstName}. Let's set up your preferences.`, "success");
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "We could not create your account."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One account for lessons, SabiGuide, and your testnet wallet links. It takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-leaf hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? <Alert tone="danger">{error}</Alert> : null}

        <Field label="Your first name" htmlFor="firstName" hint="We use this to make answers feel personal.">
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={80}
            placeholder="e.g. Ada"
            value={form.firstName}
            onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
          />
        </Field>

        <Field label="Email address" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </Field>

        <Field
          label="Create a password"
          htmlFor="password"
          hint="At least 8 characters, with one letter and one number. Do not reuse your wallet password."
        >
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Choose a password"
              className="pr-12"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </Field>

        <Field label="Confirm password" htmlFor="confirm" error={form.confirm && !confirmOk ? "The passwords do not match." : ""}>
          <Input
            id="confirm"
            name="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="Type it again"
            value={form.confirm}
            onChange={(event) => setForm((current) => ({ ...current, confirm: event.target.value }))}
          />
        </Field>

        <div className="flex items-start gap-2.5 rounded-xl border border-leaf/20 bg-mint px-3.5 py-3 text-[0.82rem] leading-relaxed text-forest">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            We only collect what we need to run the app. We never ask for wallet secrets, and AI chats are not saved
            unless you switch saving on.
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading} icon={ArrowRight}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
