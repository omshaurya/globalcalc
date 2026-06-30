"use client";
import { cn } from "@/lib/utils";
import { createContext, useContext, useState } from "react";

const TabsContext = createContext<{ active: string; set: (v: string) => void }>({ active: "", set: () => {} });

export function Tabs({ defaultValue, children, className }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [active, set] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, set }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-1 rounded-xl bg-[var(--muted)] p-1 overflow-x-auto", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active, set } = useContext(TabsContext);
  return (
    <button
      onClick={() => set(value)}
      className={cn(
        "flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
        active === value
          ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
}
