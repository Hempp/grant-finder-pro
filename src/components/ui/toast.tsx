"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string) => {
    addToast({ title, description, variant: "success" });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    addToast({ title, description, variant: "error" });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    addToast({ title, description, variant: "warning" });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    addToast({ title, description, variant: "info" });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const duration = toast.duration ?? 5000;
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onRemove, toast.id]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const variantStyles = {
    success: {
      bg: "bg-emerald-500/10 border-emerald-500/30",
      icon: "text-emerald-400",
      progress: "bg-emerald-400",
    },
    error: {
      bg: "bg-red-500/10 border-red-500/30",
      icon: "text-red-400",
      progress: "bg-red-400",
    },
    warning: {
      bg: "bg-amber-500/10 border-amber-500/30",
      icon: "text-amber-400",
      progress: "bg-amber-400",
    },
    info: {
      bg: "bg-blue-500/10 border-blue-500/30",
      icon: "text-blue-400",
      progress: "bg-blue-400",
    },
  };

  const icons = {
    success: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const styles = variantStyles[toast.variant];

  return (
    <div
      className={`
        pointer-events-auto
        bg-slate-800 border rounded-lg shadow-lg overflow-hidden
        transform transition-all duration-300 ease-out
        ${styles.bg}
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100 animate-slide-in-right"}
      `}
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`shrink-0 ${styles.icon}`}>{icons[toast.variant]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-sm text-slate-400">{toast.description}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="shrink-0 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="h-1 bg-slate-700/50">
        <div
          className={`h-full transition-all duration-100 ease-linear ${styles.progress}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
