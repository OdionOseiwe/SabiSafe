import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TONES = {
  success: "border-leaf/30 bg-mint text-forest",
  error: "border-clay/30 bg-clay-soft text-[#7a2f16]",
  warning: "border-gold/50 bg-gold-soft text-[#7a4f0a]",
  info: "border-line bg-paper text-ink",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message, tone = "info", options = {}) => {
      const id = options.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => {
        if (current.some((item) => item.id === id)) return current;
        return [...current.slice(-3), { id, message, tone }];
      });
      const timer = setTimeout(() => dismiss(id), options.duration || 5000);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-3 px-4 md:bottom-8"
        role="status"
        aria-live="polite"
      >
        {toasts.map((item) => {
          const Icon = ICONS[item.tone] || Info;
          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex w-full max-w-lg items-start gap-3 rounded-2xl border px-4 py-3 shadow-lift ${TONES[item.tone] || TONES.info}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-[0.95rem] font-medium leading-snug">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-full p-1 hover:bg-black/5"
                aria-label="Dismiss message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
