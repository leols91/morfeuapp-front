"use client";
import * as React from "react";

export function KpiCard({
  title,
  value,
  sub,
  accent = "from-white/0 to-white/0",
}: {
  title: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="col-span-12 sm:col-span-6 xl:col-span-3">
      <div className={`rounded-2xl border border-white/10 dark:border-white/10 p-4 bg-gradient-to-br ${accent}`}>
        <div className="text-xs opacity-70">{title}</div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
        {sub ? <div className="text-xs opacity-60 mt-1">{sub}</div> : null}
      </div>
    </div>
  );
}