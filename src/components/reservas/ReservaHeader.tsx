// src/components/reservas/ReservaHeader.tsx
"use client";

import { StatusBadge } from "./StatusBadge";
import { format, parseISO, isSameMonth, isSameYear, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";

type Props = {
  hospede: string;
  inicio: string;    // ISO
  fim: string;       // ISO
  acomodacao: string;
  status: import("@/types/reserva").ReservaStatus;
  saldo?: number;    // opcional
  showSaldo?: boolean; // default: false (evita duplicar com FolioSummary)
};

export function ReservaHeader({
  hospede,
  inicio,
  fim,
  acomodacao,
  status,
  saldo = 0,
  showSaldo = false,
}: Props) {
  const ini = parseISO(inicio);
  const end = parseISO(fim);
  const nights = Math.max(1, differenceInCalendarDays(end, ini));

  return (
    <div className="surface">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* título + meta */}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate">{hospede}</h1>

          {/* meta chips: período, noites, acomodação */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <MetaChip>{formatRangePTBR(ini, end)}</MetaChip>
            <MetaChip>{nights} {nights === 1 ? "noite" : "noites"}</MetaChip>
            <MetaChip>{acomodacao}</MetaChip>
          </div>
        </div>

        {/* status + (opcional) saldo */}
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {showSaldo && (
            <div
              className={`
                rounded-xl px-3 py-1 border text-sm border-subtle
                ${saldo > 0 ? "text-amber-300" : saldo < 0 ? "text-emerald-300" : "opacity-90"}
              `}
              title="Saldo do folio"
            >
              Saldo: <span className="font-semibold">{formatBRL(saldo)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-1 opacity-80">
      {children}
    </span>
  );
}

function formatRangePTBR(ini: Date, end: Date) {
  // exemplos:
  // 25–28/09/2025 (mesmo mês/ano)
  // 28/09 — 02/10/2025 (mesmo ano, meses diferentes)
  // 28/12/2025 — 03/01/2026 (anos diferentes)
  if (isSameYear(ini, end)) {
    if (isSameMonth(ini, end)) {
      const left = format(ini, "dd/MM/yy", { locale: ptBR });
      const right = format(end, "dd/MM/yy", { locale: ptBR });
      return `${left}–${right}`;
    }
    const left = format(ini, "dd/MM", { locale: ptBR });
    const right = format(end, "dd/MM/yyyy", { locale: ptBR });
    return `${left} — ${right}`;
  }
  const left = format(ini, "dd/MM/yyyy", { locale: ptBR });
  const right = format(end, "dd/MM/yyyy", { locale: ptBR });
  return `${left} — ${right}`;
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}