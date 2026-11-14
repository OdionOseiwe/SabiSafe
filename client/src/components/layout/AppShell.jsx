import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Logo } from "../brand/Logo";
import { Badge, Button, buttonStyles } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { initials, shortAddress } from "../../lib/format";

const NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/assistant", label: "Ask Sabi", icon: Sparkles },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/send", label: "Send", icon: ArrowUpRight },
  { to: "/receive", label: "Receive", icon: ArrowDownToLine },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/safety", label: "Safety", icon: ShieldCheck },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

const TITLES = {
  "/dashboard": "Home",
  "/assistant": "Ask Sabi",
  "/learn": "Learning Centre",
  "/practice": "Practice",
  "/wallet": "Wallet",
  "/send": "Send money",
  "/receive": "Receive money",
  "/contacts": "Trusted contacts",
  "/safety": "Safety Centre",
  "/history": "Transaction history",
  "/settings": "Settings",
};

function WalletButton({ compact = false }) {
  const { wallet, loading, connecting, connect } = useWallet();
  const navigate = useNavigate();

  if (loading) {
    return <div className="h-10 w-32 animate-pulse rounded-full bg-sand" aria-hidden="true" />;
  }

  if (wallet) {
    return (
      <button
        type="button"
        onClick={() => navigate("/wallet")}
        className="inline-flex max-w-[9.5rem] items-center gap-2 rounded-full border border-leaf/25 bg-mint px-3 py-2 text-[0.82rem] font-semibold text-forest transition-colors hover:border-leaf"
        aria-label={`Wallet ${wallet.address}, open wallet page`}
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-leaf" aria-hidden="true" />
        <span className="truncate">{compact ? shortAddress(wallet.address, 6, 4) : shortAddress(wallet.address, 10, 6)}</span>
      </button>
    );
  }

  return (
    <Button size="sm" variant="primary" loading={connecting} onClick={() => connect().catch(() => {})}>
      <span className="sm:hidden">Connect</span>
      <span className="hidden sm:inline">Connect wallet</span>
    </Button>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-line bg-paper py-1 pl-1 pr-2 transition-colors hover:border-leaf sm:pr-3"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-[0.72rem] font-bold text-cream">
          {initials(user.firstName)}
        </span>
        <span className="hidden max-w-24 truncate text-[0.85rem] font-semibold text-ink sm:block">{user.firstName}</span>
        <ChevronDown className="hidden h-4 w-4 text-muted sm:block" aria-hidden="true" />
      </button>
      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-paper shadow-lift"
          role="menu"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{user.firstName}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-ink hover:bg-cream"
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            role="menuitem"
          >
            <Settings className="h-4 w-4 text-muted" /> Settings and privacy
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 border-t border-line px-4 py-3 text-left text-sm font-medium text-clay hover:bg-clay-soft"
            onClick={async () => {
              setOpen(false);
              await logout();
              navigate("/");
            }}
            role="menuitem"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function NavItem({ item, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.95rem] font-medium transition-colors ${
          isActive ? "bg-forest text-cream shadow-soft" : "text-ink hover:bg-sand"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-5 w-5 ${isActive ? "text-gold" : "text-leaf"}`} aria-hidden="true" />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const title = TITLES[location.pathname] || "SabiSafe";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-cream">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-line bg-paper px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <div className="mt-6 flex items-center justify-between rounded-xl border border-gold/40 bg-gold-soft px-3 py-2">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#8a5a10]">Testnet only</span>
          <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
        </div>
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-slim" aria-label="Main navigation">
          {NAV.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>
        <div className="mt-4 rounded-2xl border border-line bg-cream p-3.5">
          <p className="text-[0.8rem] font-semibold text-ink">Practising safely</p>
          <p className="mt-1 text-[0.78rem] leading-relaxed text-muted">
            Aurora testnet ETH has no real value. Real payments never happen here.
          </p>
          <Link to="/safety" className="mt-2 inline-flex items-center gap-1 text-[0.78rem] font-semibold text-leaf hover:underline">
            Safety Centre <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-line/80 bg-cream/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="shrink-0 rounded-full border border-line bg-paper p-2 text-ink lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 lg:hidden">
                <Logo compact />
              </div>
              <div className="hidden lg:block">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted">SabiSafe</p>
                <h1 className="text-lg font-semibold leading-tight text-ink">{title}</h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <Badge tone="gold">Aurora Testnet</Badge>
              </div>
              <WalletButton compact />
              <UserMenu />
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pt-8 lg:pb-12">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
          <p className="mt-10 border-t border-line pt-5 text-[0.75rem] leading-relaxed text-muted">
            SabiSafe is a learning and practice tool on Aurora testnet. It is not a bank, a wallet provider, or financial
            advice. We will never ask for your recovery phrase, private key, OTP, or PIN.
          </p>
        </main>
      </div>

      {/* Mobile slide-over */}
      {menuOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-paper px-4 py-5 shadow-lift">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-line p-2"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 flex-1 space-y-1 overflow-y-auto" aria-label="Mobile navigation">
              {NAV.map((item) => (
                <NavItem key={item.to} item={item} onNavigate={() => setMenuOpen(false)} />
              ))}
            </nav>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <div className="flex items-center gap-2">
                <CircleUserRound className="h-6 w-6 text-leaf" />
                <span className="text-sm font-semibold">{user?.firstName}</span>
              </div>
              <Link to="/settings" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-leaf">
                Settings
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
        aria-label="Quick navigation"
      >
        <div className="grid grid-cols-5">
          {[
            { to: "/dashboard", label: "Home", icon: LayoutDashboard },
            { to: "/assistant", label: "Ask", icon: Sparkles },
            { to: "/wallet", label: "Wallet", icon: Wallet },
            { to: "/send", label: "Send", icon: ArrowUpRight },
            { to: "/history", label: "History", icon: History },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-xl py-1.5 text-[0.68rem] font-semibold ${
                    isActive ? "text-forest" : "text-muted"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`rounded-full px-3 py-1 ${isActive ? "bg-mint" : ""}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export { NAV, WalletButton };
