import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { PageLoader } from "./components/ui";
import { AppShell } from "./components/layout/AppShell";

// Pages are split so the first screen stays light on a slow phone.
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Assistant = lazy(() => import("./pages/Assistant"));
const Learn = lazy(() => import("./pages/Learn"));
const Lesson = lazy(() => import("./pages/Lesson"));
const Practice = lazy(() => import("./pages/Practice"));
const WalletPage = lazy(() => import("./pages/Wallet"));
const Receive = lazy(() => import("./pages/Receive"));
const PublicReceiveRequest = lazy(() => import("./pages/PublicReceiveRequest"));
const Send = lazy(() => import("./pages/Send"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Safety = lazy(() => import("./pages/Safety"));
const HistoryPage = lazy(() => import("./pages/History"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

function RequireOnboarded() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboarded) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader label="Opening SabiSafe…" />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/receive/request/:id" element={<PublicReceiveRequest />} />

        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>

        <Route element={<RequireOnboarded />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:slug" element={<Lesson />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/send" element={<Send />} />
            <Route path="/receive" element={<Receive />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
