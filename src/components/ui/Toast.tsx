"use client";
import { cn } from "@/lib/utils";
import { createContext, useCallback, useContext, useState } from "react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

const ToastContext = createContext<{ toast: (msg: string, type?: Toast["type"]) => void }>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 no-print">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg",
              "animate-[slideIn_0.3s_ease]",
              t.type === "success" && "bg-green-500 text-white",
              t.type === "error" && "bg-red-500 text-white",
              t.type === "info" && "bg-[var(--primary)] text-white",
            )}
          >
            {t.type === "success" && "✓"}
            {t.type === "error" && "✕"}
            {t.type === "info" && "ℹ"}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
