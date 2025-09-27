// src/components/reservas/ReservasTable.tsx
"use client";
import { StatusBadge } from "./StatusBadge";
import type { ReservaDTO } from "@/types/reserva";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/components/ui/cn";

export function ReservasTable({ data }: { data: ReservaDTO[] }) {
  return (
    <>
      {/* Desktop: tabela */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Hóspede</Th>
                <Th>Período</Th>
                <Th>Acomodação</Th>
                <Th>Status</Th>
                <Th>Canal</Th>
                <Th className="text-right">Saldo</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {data.map((r) => (
                <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td>{r.hospedeNome}</Td>
                  <Td>{formatPeriodo(r.inicio, r.fim)}</Td>
                  <Td>{r.acomodacao}</Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td>{r.canal ?? "—"}</Td>
                  <Td className="text-right">{formatSaldo(r.saldo)}</Td>
                  <Td className="text-right">
                    <Link
                      href={`/reservas/${r.id}` as Route}
                      className="text-brand-700 hover:underline dark:text-brand-300"
                    >
                      Detalhes →
                    </Link>
                  </Td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <Td colSpan={7} className="text-center py-8 opacity-70">Nenhuma reserva encontrada</Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {data.map((r) => (
          <div key={r.id} className="surface-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.hospedeNome}</div>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-2 text-sm opacity-80">{formatPeriodo(r.inicio, r.fim)}</div>
            <div className="mt-1 text-sm">{r.acomodacao}</div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="opacity-80">{r.canal ?? "—"}</span>
              <span className="font-semibold">{formatSaldo(r.saldo)}</span>
            </div>
            <div className="mt-3 text-right">
              <Link href={`/reservas/${r.id}` as Route} className="text-brand-700 hover:underline dark:text-brand-300">
                Detalhes →
              </Link>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="surface-2 text-center py-8 opacity-70">Nenhuma reserva encontrada</div>
        )}
      </div>
    </>
  );
}

function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props} className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wide opacity-70", props.className)} />;
}
function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn("px-4 py-3 align-middle", props.className)} />;
}
function formatPeriodo(i: string, f: string) {
  const si = parseISO(i), sf = parseISO(f);
  return `${format(si, "dd/MM/yyyy", { locale: ptBR })} — ${format(sf, "dd/MM/yyyy", { locale: ptBR })}`;
}
function formatSaldo(v?: number) {
  if (v == null) return "R$ 0,00";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}