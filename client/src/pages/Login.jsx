import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Alert, Button, Field, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.onboarded ? "/dashboard" : "/onboarding", { replace: true });
    }
  }, [user, navigate]);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const next = await login(form.email.trim(), form.password);
      toast(`Welcome back, ${next.firstName}.`, "success");
      const from = location.state?.from;
      navigate(from && from !== "/login" ? from : next.onboarded ? "/dashboard" : "/onboarding", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "We could not sign you in."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your lessons, ask Sabi, or check your testnet wallet."
      footer={
        <>
          New to SabiSafe?{" "}
          <Link to="/register" className="font-semibold text-leaf hover:underline">
            Create a free account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? <Alert tone="danger">{error}</Alert> : null}

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

        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Your password"
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

        <Button type="submit" size="lg" className="w-full" loading={loading} icon={ArrowRight}>
          Sign in
        </Button>

        <p className="flex items-start gap-2 rounded-xl border border-line bg-paper px-3.5 py-3 text-[0.8rem] leading-relaxed text-muted">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden="true" />
          SabiSafe will never ask for your recovery phrase, private key, OTP, or PIN. If someone does, it is a scam.
        </p>
      </form>
    </AuthLayout>
  );
}
