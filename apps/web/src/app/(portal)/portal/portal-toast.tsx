"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type ToastKind = "error" | "success";
type Toast = { id: number; kind: ToastKind; message: string };
type ToastContextValue = {
  notify: (kind: ToastKind, message: string) => void;
};

const PortalToastContext = createContext<ToastContextValue | null>(null);

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(
      () => onDismiss(toast.id),
      toast.kind === "error" ? 7000 : 4500,
    );
    return () => window.clearTimeout(timer);
  }, [onDismiss, paused, toast.id, toast.kind]);

  const Icon = toast.kind === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`portal-toast portal-${toast.kind}`}
      role={toast.kind === "error" ? "alert" : "status"}
      aria-atomic="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <Icon className="portal-toast-icon" aria-hidden="true" />
      <p>{toast.message}</p>
      <button
        className="portal-toast-dismiss"
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}

export function PortalToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const notify = useCallback((kind: ToastKind, message: string) => {
    setToasts((current) => [
      ...current.slice(-2),
      { id: ++nextId.current, kind, message },
    ]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <PortalToastContext.Provider value={{ notify }}>
      {children}
      <aside className="portal-toast-viewport" aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </aside>
    </PortalToastContext.Provider>
  );
}

export function usePortalToast() {
  const context = useContext(PortalToastContext);
  if (!context) {
    throw new Error("usePortalToast must be used within PortalToastProvider");
  }
  return context;
}
