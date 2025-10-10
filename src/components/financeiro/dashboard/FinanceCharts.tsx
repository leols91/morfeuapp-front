"use client";
import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { money } from "@/components/financeiro/utils";

export function FinanceCharts({
  fluxoData,
  despesasPorCategoria,
}: {
  fluxoData: Array<{ date: string; Entradas: number; Saídas: number; Saldo: number }>;
  despesasPorCategoria: Array<{ name: string; value: number }>;
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 xl:col-span-8 surface">
        <h3 className="text-sm font-semibold mb-3">Fluxo de caixa (últimos 30 dias)</h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fluxoData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="inflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeOpacity={0.2} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, opacity: 0.8 }} />
              <YAxis tick={{ fontSize: 12, opacity: 0.8 }} />
              <Tooltip formatter={(v: any) => money(Number(v))} />
              <Legend />
              <Area type="monotone" dataKey="Entradas" stroke="#10B981" fill="url(#inflow)" strokeWidth={2} />
              <Area type="monotone" dataKey="Saídas" stroke="#EF4444" fill="url(#outflow)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-12 xl:col-span-4 surface">
        <h3 className="text-sm font-semibold mb-3">Despesas por categoria (mês)</h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={despesasPorCategoria}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={2}
              >
                {despesasPorCategoria.map((entry, index) => {
                  const palette = ["#6366F1", "#F59E0B", "#10B981", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"];
                  return <Cell key={`pc-${index}`} fill={palette[index % palette.length]} />;
                })}
              </Pie>
              <Legend />
              <Tooltip formatter={(v: any) => money(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}