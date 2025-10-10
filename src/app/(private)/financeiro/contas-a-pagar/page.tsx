"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/form/Field";
import { listAPInvoices, type APInvoiceDTO } from "@/services/financeiro";
import { Th, Td, fmtMoney, fmtDate } from "@/components/financeiro/utils";
import { APInvoiceFormModal } from "@/components/financeiro/APInvoiceFormModal";
import { APInvoiceDetailsModal } from "@/components/financeiro/APInvoiceDetailsModal";

type StatusFilter = "all" | "open" | "paid" | "canceled";

export default function APPage() {
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const { data, refetch, isFetching } = useQuery<APInvoiceDTO[]>({
    queryKey: ["ap-invoices", status],
    queryFn: () => listAPInvoices({ status }),
  });

  const [openCreate, setOpenCreate] = React.useState(false);
  const [openDetails, setOpenDetails] = React.useState(false);
  const [current, setCurrent] = React.useState<APInvoiceDTO | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contas a pagar</h1>
        <Button onClick={() => setOpenCreate(true)}>Nova conta a pagar</Button>
      </div>

      <div className="surface-2">
        <form className="grid grid-cols-12 gap-3 items-end" onSubmit={(e) => { e.preventDefault(); refetch(); }}>
          <div className="col-span-12 md:col-span-6">
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
                <option value="all">Todos</option>
                <option value="open">Em aberto</option>
                <option value="paid">Pagas</option>
                <option value="canceled">Canceladas</option>
              </Select>
            </Field>
          </div>
          <div className="col-span-12 md:col-span-6 flex justify-end">
            <Button type="submit" disabled={isFetching}>{isFetching ? "Filtrando…" : "Aplicar"}</Button>
          </div>
        </form>
      </div>

      <div className="surface">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Vencimento</Th>
                <Th>Fornecedor</Th>
                <Th>Descrição</Th>
                <Th>Status</Th>
                <Th className="text-right">Valor</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {(data ?? []).map((inv) => (
                <tr key={inv.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td>{fmtDate(inv.dueDate)}</Td>
                  <Td className="truncate max-w-[220px]">{inv.supplier.legalName}</Td>
                  <Td className="truncate max-w-[280px]">{inv.description}</Td>
                  <Td className={
                    inv.status === "open" ? "text-orange-600 dark:text-orange-300" :
                    inv.status === "paid" ? "text-emerald-600 dark:text-emerald-300" :
                    "text-rose-600 dark:text-rose-300"
                  }>
                    {inv.status === "open" ? "Em aberto" : inv.status === "paid" ? "Paga" : "Cancelada"}
                  </Td>
                  <Td className="text-right tabular-nums">{fmtMoney(inv.amount)}</Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                      onClick={() => { setCurrent(inv); setOpenDetails(true); }}
                    >
                      Detalhes
                    </button>
                  </Td>
                </tr>
              ))}
              {(data ?? []).length === 0 && (
                <tr><Td colSpan={6} className="text-center py-8 opacity-70">Nenhuma conta</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openCreate && (
        <APInvoiceFormModal open={openCreate} onClose={() => setOpenCreate(false)} onCreated={() => refetch()} />
      )}

      {openDetails && (
        <APInvoiceDetailsModal open={openDetails} onClose={() => setOpenDetails(false)} invoice={current} />
      )}
    </div>
  );
}