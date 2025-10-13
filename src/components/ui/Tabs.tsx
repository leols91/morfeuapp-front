"use client";
import * as React from "react";
import { cx } from "./form/cx";

/** CONTEXTO */
type TabsContextValue = {
  value: string;
  onValueChange: (val: string) => void;
};
const TabsContext = React.createContext<TabsContextValue | null>(null);

/** ROOT */
export function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cx("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

/** LIST */
export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "inline-flex flex-wrap gap-2 rounded-xl border border-subtle bg-white/80 dark:bg-slate-900/60 p-1",
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

/** TRIGGER */
export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used inside <Tabs>");
  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onValueChange(value)}
      className={cx(
        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none",
        isActive
          ? // 🔹 Igual ao hover: fundo leve e discreto
            "bg-black/5 dark:bg-white/10 text-foreground"
          : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10",
        className
      )}
    >
      {children}
    </button>
  );
}

/** CONTENT */
export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used inside <Tabs>");
  if (ctx.value !== value) return null;

  return <div className={cx("mt-3", className)}>{children}</div>;
}