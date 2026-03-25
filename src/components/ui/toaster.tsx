"use client";
import * as React from "react";

const ToastContext = React.createContext<{
  toast: (opts: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
}>({ toast: () => {} });

export function useToast() {
  return React.useContext(ToastContext);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<
    { id: number; title: string; description?: string; variant?: string }[]
  >([]);

  const toast = React.useCallback(
    ({ title, description, variant = "default" }: { title: string; description?: string; variant?: string }) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl border p-4 shadow-xl glass animate-in slide-in-from-right-5 duration-300 ${
              t.variant === "destructive"
                ? "border-red-500/20 bg-red-950/60"
                : "border-white/10 bg-luna-dark-3"
            }`}
          >
            <p className="font-semibold text-sm text-white">{t.title}</p>
            {t.description && (
              <p className="text-xs text-white/60 mt-0.5">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
