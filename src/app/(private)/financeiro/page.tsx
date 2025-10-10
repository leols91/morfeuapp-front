"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import ModalBase from "@/components/ui/ModalBase";
import FinanceMenu from "@/components/financeiro/FinanceMenu";

import { KpiCard } from "@/components/financeiro/dashboard/KpiCard";
import { FinanceCharts } from "@/components/financeiro/dashboard/FinanceCharts";
import { SimpleTable } from "@/components/financeiro/dashboard/SimpleTable";
import { PayInvoiceModal } from "@/components/financeiro/PayInvoiceModal";
import {
  money,
  fmtDate,
  addDays,
  type Id,
  type CashAccount,
  type APItem,
} from "@/components/financeiro/utils";

/* =========================================================================
 * Mock data (trocar por services quando quiser)
 * ========================================================================= */
const MOCK_ACCOUNTS: CashAccount[] = [
  { id: "acc_caixa", name: "Caixa", balance: 1200 },
  { id: "acc_banco", name: "Banco", balance: 1800 },
];

const today = new Date();
const MOCK_AP: APItem[] = [
  {
    id: "ap01",
    description: "Compra Mercado Central",
    category: "Insumos",
    amount: 450,
    dueDate: addDays(today, 2).toISOString(),
    status: "open",
    supplier: "Mercado Central",
  },
  {
    id: "ap02",
    description: "Gás e Cozinha",
    category: "Utilidades",
    amount: 320,
    dueDate: addDays(today, 5).toISOString(),
    status: "open",
    supplier: "GLP Master",
  },
  {
    id: "ap03",
    description: "Energia Elétrica",
    category: "Utilidades",
    amount: 690,
    dueDate: addDays(today, -3).toISOString(),
    status: "open",
    supplier: "Concessionária",
  },
  {
    id: "ap04",
    description: "Lavanderia Industrial",
    category: "Serviços",
    amount: 280,
    dueDate: addDays(today, -1).toISOString(),
    status: "open",
    supplier: "LavaMax",
  },
  {
    id: "ap05",
    description: "Internet",
    category: "Utilidades",
    amount: 120,
    dueDate: addDays(today, 10).toISOString(),
    status: "open",
    supplier: "NetFiber",
  },
  {
    id: "ap06",
    description: "Hortifruti",
    category: "Insumos",
    amount: 160,
    dueDate: addDays(today, 0).toISOString(),
    status: "open",
    supplier: "Quitanda Sol",
  },
];

const MOCK_EXPECTED_REVENUE: Array<{ date: string; amount: number }> = Array.from({ length: 14 }).map(
  (_, i) => {
    const d = addDays(today, i);
    const rnd = [0, 0, 200, 500, 350, 0, 150][i % 7]; // simula padrão semanal
    return { date: d.toISOString(), amount: rnd };
  }
);

const MOCK_CASH_SERIES: Array<{ date: string; inflow: number; outflow: number }> = Array.from({
  length: 30,
}).map((_, i) => {
  const d = addDays(today, -29 + i);
  return {
    date: d.toISOString(),
    inflow: Math.max(0, 200 + Math.sin(i / 3) * 150 + (i % 5 === 0 ? 400 : 0)),
    outflow: Math.max(0, 180 + Math.cos(i / 4) * 120 + (i % 6 === 0 ? 300 : 0)),
  };
});

/* =========================================================================
 * Page
 * ========================================================================= */
export default function FinanceiroPage() {
  const [accounts, setAccounts] = useState<CashAccount[]>(MOCK_ACCOUNTS);
  const [ap, setAp] = useState<APItem[]>(MOCK_AP);
  const saldoEmContas = useMemo(() => accounts.reduce((a, c) => a + c.balance, 0), [accounts]);

  // KPIs
  const receitaPrev7d = useMemo(() => {
    const next7 = addDays(today, 7).toISOString();
    return MOCK_EXPECTED_REVENUE.filter((r) => r.date <= next7).reduce((a, c) => a + c.amount, 0);
  }, []);

  const aVencer7d = useMemo(() => {
    const t0 = today;
    const t7 = addDays(today, 7);
    return ap.filter(
      (i) => i.status === "open" && new Date(i.dueDate) >= t0 && new Date(i.dueDate) <= t7
    );
  }, [ap]);

  const vencidas = useMemo(() => {
    return ap.filter((i) => i.status === "open" && new Date(i.dueDate) < today);
  }, [ap]);

  // Gráficos
  const fluxoData = useMemo(() => {
    return MOCK_CASH_SERIES.map((d) => ({
      date: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      Entradas: Math.round(d.inflow),
      Saídas: Math.round(d.outflow),
      Saldo: Math.round(d.inflow - d.outflow),
    }));
  }, []);

  const despesasPorCategoria = useMemo(() => {
    const openThisMonth = ap.filter((i) => {
      const dd = new Date(i.dueDate);
      const now = new Date();
      return (
        i.status === "open" &&
        dd.getMonth() === now.getMonth() &&
        dd.getFullYear() === now.getFullYear()
      );
    });
    const map = new Map<string, number>();
    openThisMonth.forEach((i) => {
      const k = i.category ?? "Outros";
      map.set(k, (map.get(k) ?? 0) + i.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [ap]);

  // Modal de pagamento
  const [paying, setPaying] = useState<APItem | null>(null);

  function onConfirmPay(params: { apId: Id; accountId: Id; paidAt: string; amount: number; reference?: string }) {
    // Atualiza conta e marca AP como paga (mock local)
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === params.accountId ? { ...acc, balance: acc.balance - params.amount } : acc
      )
    );
    setAp((prev) => prev.map((i) => (i.id === params.apId ? { ...i, status: "paid" } : i)));
    setPaying(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center ">
        <h1 className="text-xl font-semibold">Financeiro</h1>
        <FinanceMenu />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-12 gap-4">
        <KpiCard title="Receita prevista (próx. 7 dias)" value={money(receitaPrev7d)} accent="from-emerald-500/10 to-emerald-500/0" />
        <KpiCard title="Saldo em caixa" value={money(saldoEmContas)} accent="from-indigo-500/10 to-indigo-500/0" />
        {/* sem “3 títulos” nos dois abaixo */}
        <KpiCard title="Vencendo (7 dias)" value={money(aVencer7d.reduce((a,c)=>a+c.amount,0))} accent="from-amber-500/10 to-amber-500/0" />
        <KpiCard title="Vencidas" value={money(vencidas.reduce((a,c)=>a+c.amount,0))} accent="from-rose-500/10 to-rose-500/0" />
      </div>

      {/* Gráficos */}
      <FinanceCharts fluxoData={fluxoData} despesasPorCategoria={despesasPorCategoria} />

      {/* Tabelas */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-6 surface">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">A vencer (próx. 7 dias)</h3>
          </div>
          <SimpleTable
            items={aVencer7d}
            onPay={(i) => setPaying(i)}
          />
        </div>

        <div className="col-span-12 xl:col-span-6 surface">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Em atraso</h3>
          </div>
          <SimpleTable
            items={vencidas}
            onPay={(i) => setPaying(i)}
          />
        </div>
      </div>

      {/* Modal Pagar */}
      {paying && (
        <PayInvoiceModal
          open={!!paying}
          ap={paying}
          accounts={accounts}
          onClose={() => setPaying(null)}
          onConfirm={onConfirmPay}
        />
      )}
    </div>
  );
}