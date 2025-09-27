// src/components/reservas/FolioSummary.tsx
"use client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { FolioEntry, PaymentDTO } from "@/types/reserva";

export function FolioSummary({ saldo }: { saldo: number }) {
  return (
    <div className="surface-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm opacity-70">Saldo do folio</div>
        <div className="text-2xl font-bold">{formatBRL(saldo)}</div>
      </div>
    </div>
  );
}

export function FolioEntries({ entries }: { entries: FolioEntry[] }) {
  return (
    <div className="surface">
      <h3 className="text-lg font-semibold mb-3">Lançamentos</h3>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Data</Th><Th>Tipo</Th><Th>Descrição</Th><Th className="text-right">Valor</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td>{format(parseISO(e.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</Td>
                  <Td>{labelType(e.type)}</Td>
                  <Td>{e.description}</Td>
                  <Td className="text-right">{formatBRL(e.amount)}</Td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr><Td colSpan={4} className="text-center py-8 opacity-70">Não há lançamentos</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="surface-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{labelType(e.type)}</div>
              <div className="font-semibold">{formatBRL(e.amount)}</div>
            </div>
            <div className="mt-1 text-sm">{e.description}</div>
            <div className="mt-1 text-xs opacity-70">{format(parseISO(e.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="surface-2 text-center py-8 opacity-70">Não há lançamentos</div>
        )}
      </div>
    </div>
  );
}

export function FolioPayments({ payments }: { payments: PaymentDTO[] }) {
  return (
    <div className="surface">
      <h3 className="text-lg font-semibold mb-3">Pagamentos</h3>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Data</Th><Th>Método</Th><Th className="text-right">Valor</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td>{format(parseISO(p.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</Td>
                  <Td>{p.method}</Td>
                  <Td>{formatBRL(p.amount)}</Td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><Td colSpan={3} className="text-center py-8 opacity-70">Não há pagamentos</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="surface-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.method}</div>
              <div className="font-semibold">{formatBRL(p.amount)}</div>
            </div>
            <div className="mt-1 text-xs opacity-70">{format(parseISO(p.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
          </div>
        ))}
        {payments.length === 0 && (
          <div className="surface-2 text-center py-8 opacity-70">Não há pagamentos</div>
        )}
      </div>
    </div>
  );
}

function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props} className={"px-4 py-3 text-xs font-semibold uppercase tracking-wide opacity-70 text-left"} />;
}
function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  const cls = `px-4 py-3 align-middle ${props.className ?? ""}`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { className, ...rest } = props;
  return <td {...rest} className={cls} />;
}
function labelType(t: FolioEntry["type"]) {
  if (t === "room_charge") return "Diária";
  if (t === "product") return "Produto";
  return "Ajuste";
}
function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}