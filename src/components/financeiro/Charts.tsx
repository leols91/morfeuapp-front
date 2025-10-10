"use client";
import * as React from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

function currencyBR(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function MiniArea({
  data, yKey = "value", xKey = "label", height = 160, label,
}: { data: Array<Record<string, any>>; yKey?: string; xKey?: string; height?: number; label?: string; }) {
  return (
    <div className="rounded-2xl border-subtle border p-4">
      {label ? <div className="text-xs opacity-70 mb-2">{label}</div> : null}
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => (v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v))} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any) => currencyBR(Number(v))} />
            <Area type="monotone" dataKey={yKey} fill="currentColor" stroke="currentColor" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MiniBars({
  data, xKey = "name", yKey = "value", height = 180, label,
}: { data: Array<Record<string, any>>; xKey?: string; yKey?: string; height?: number; label?: string; }) {
  return (
    <div className="rounded-2xl border-subtle border p-4">
      {label ? <div className="text-xs opacity-70 mb-2">{label}</div> : null}
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any) => currencyBR(Number(v))} />
            <Bar dataKey={yKey} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MiniDonut({
  data, dataKey = "value", nameKey = "name", height = 220, label,
}: { data: Array<{ name: string; value: number }>; dataKey?: string; nameKey?: string; height?: number; label?: string; }) {
  return (
    <div className="rounded-2xl border-subtle border p-4">
      {label ? <div className="text-xs opacity-70 mb-2">{label}</div> : null}
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Legend />
            <Tooltip formatter={(v: any) => currencyBR(Number(v))} />
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={60} outerRadius={80}>
              {data.map((_, i) => <Cell key={i} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}